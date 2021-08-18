<template>
    <v-avatar :size="size" :color="`${theme} lighten-4`">
        <input class="absolute width-0 height-0" type="file" :ref="uniqueId" :accept="mime" @change="onFileChange">

        <v-icon v-if="! path"
            style="cursor: pointer;"
            @click="onUploadClick"
        >upload</v-icon>
        

    </v-avatar>
</template>

<script>
import { mapState } from 'vuex';

export default {
    props: {
        mime: {
            type: String,
            default: 'image/jpeg'
        },

        size: {
            type: String | Number,
            default: 24
        },

        value: {
            type: String
        }
    },

    computed: {
        ...mapState({
            theme: state => state.theme,
            uploader: state => state.uploader,
        })
    },

    data:() => ({
        path: null,
        
        uniqueId: Math.floor(1000 + Math.random() * 9000),

        upload: {
            chunks: [],
            max: 1024,
            size: 524288, // 512byte * 1024
            fileSize: 0,
            loadedSize: 0,
        },
    }),

    methods: {
        digest: async function(message) {
            return Array.prototype.map.call(
                new Uint8Array(
                    await crypto.subtle.digest('SHA-256', new TextEncoder().encode(message))
                ),
                (x) => ("0" + x.toString(16)).slice(-2)
            ).join("");
        },

        fileRead: function(file) {
            return new Promise((resolve, reject) => {
                try {
                    let chunks = [];
                    let chunkSize = this.upload.size;
                    let chunkTotal = Math.ceil(file.size / chunkSize);
                    
                    for (let i = 0; i < chunkTotal; i++) {
                        let chunkOffset = i * chunkSize;

                        if (chunkOffset > 0) {
                            chunkOffset = chunkOffset + 1;
                        }
                        
                        let chunkSlice = file.slice(
                            chunkOffset,
                            Math.min(i * chunkSize + chunkSize, file.size), 
                            file.type
                        );

                        chunks.push(chunkSlice);                        
                    }

                    let reader = new FileReader();
                    
                    reader.onload = (event) => {
                        this.digest(event.target.result).then((uuid) => {
                            resolve({ 
                                chunks: chunks, 
                                fileSize: file.size,
                                fileType: file.type,
                                uuid: uuid
                            });
                        });
                    };

                    reader.readAsText(chunks[0]);
                } catch (error) {
                    reject(error);
                }
            });
        },

        onFileChange: function(event) {
            this.fileRead(
                event.target.files.item(0),
            ).then(({chunks, fileSize, fileType, uuid}) => {
                this.upload.fileSize = fileSize;
                this.state = 'upload';
                
                chunks.forEach((chunk, index) => {
                    let data = new FormData;
                        data.set('file', chunk);
                        data.set('type', fileType);
                        data.set('extension', this.extension);
                        data.set('uuid', uuid);
                        data.set('part', index + 1);
                        
                    if (index + 1 >= chunks.length) {
                        data.set('last', true);
                    }

                    this.upload.chunks.push(data);
                });
            });
        },

        postUploadFile: async function(formData) {
            this.uploader({
                method: 'POST',
                data: formData,
                url: 'account/api/document',
                
                onUploadProgress: (event) => {
                    this.upload.loadedSize += parseInt(event.loaded);
                    this.progress = Math.floor((this.upload.loadedSize / this.upload.fileSize) * 100);
                }
            }).then(({ data: { url, path }}) => {
                setTimeout(() => {
                    this.upload.chunks.shift();

                    if (url) {
                        this.upload.chunks = [];
                        this.upload.loadedSize = 0;
                        this.upload.fileSize = 0;
                        this.state = 'preview';

                        if (url && url !== this.value) {
                            this.$emit('input', url);
                        }
                    }
                }, 250);
            }).catch(() => {

            });
        },

        onUploadClick: function() {
            this.$refs[this.uniqueId].click();
        },
    },

    watch: {
        'upload.chunks': function(chunks) {
            if (Array.isArray(chunks) && chunks.length > 0) {
                this.postUploadFile(this.upload.chunks[0]);
            }
        },

        value: {
            handler: function(value) {
                this.path = value
            },

            immediate: true,
        }
    }
}
</script>