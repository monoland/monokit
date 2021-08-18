<template>
    <view-avatar :size="size" :value="value" @input="updateValue">
        <slot></slot>
    </view-avatar>
</template>

<script>
export default {
    name: 'mono-view-avatar',

    components: {
        'view-avatar': () => {
            if (window.breakpoint === 'desktop') {
                return import(/* webpackChunkName: "desktop-components" */ '@components/web/viewAvatar');
            }

            return import(/* webpackChunkName: "mobile-components" */ '@components/mobile/viewAvatar');
        }
    },

    props: {
        size: {
            type: String | Number,
            default: 24
        },

        value: {
            type: String,
            default: null
        }
    },

    methods: {
        updateValue: function(value) {
            this.$emit('input', value);
        }
    }
}
</script>