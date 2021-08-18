<template>
    <v-list class="transparent py-0">
        <v-list-item-group 
            :active-class="`${theme} lighten-5`" 
            v-model="selected"
        >
            <template v-for="(record, index) in records">
                <slot name="mobile_record" :record="record" :index="index"></slot>
            </template>

            <template v-if="records.length <= 0">
                <v-list-item>
                    <v-list-item-content>
                        <v-list-item-title class="text-center grey--text">There is no data to display</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </template>

            <template v-else>
                <v-list-item v-if="table.current_page && table.current_page < table.last_page">
                    <div class="d-flex align-center justify-center" style="width: 100%;">
                        <v-progress-circular
                            :width="2"
                            :color="theme"
                            indeterminate
                            v-intersect="intersect"
                        ></v-progress-circular>
                    </div>
                </v-list-item>
            </template>
        </v-list-item-group>
    </v-list>
</template>

<script>
import { mapState } from 'vuex';

export default {
    computed: {
        ...mapState({
            page: state => state.module.page,
            records: state => state.module.records,
            table: state => state.module.table,
            theme: state => state.theme,
        }),

        selected: {
            get: function() {
                return this.$store.state.module.page.selected_index;
            },

            set: function(selected) {
                this.$store.commit('PAGE_SELECTED', selected);
            }
        }
    },

    created() {
        this.$store.commit('MODULE_DATATYPE', 'list');
    },

    methods: {
        intersect: function(entries) {
            if (entries[0].isIntersecting) {
                let nextPage = this.table.current_page + 1 > this.table.last_page ? this.table.last_page : this.table.current_page + 1;

                this.$store.commit('BUILD_REQUEST_PARAMS', { options: { page: nextPage }});
                this.$store.dispatch('fetch_records', { reset: false });
            }
        }
    }
}
</script>