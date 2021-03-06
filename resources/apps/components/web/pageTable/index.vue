<template>
    <v-data-table
        fixed-header
        :headers="page.headers"
        :height="`calc(100vh - 211px)`"
        :disable-pagination="disabled"
        :items="records"
        :item-key="page.key"
        :server-items-length="table.total"
        :options.sync="table.options"
        :footer-props="{ 
            'disable-items-per-page': disabled, 
            'items-per-page-options': [10, 25, 50, 100, 250] 
        }"
        :disable-sort="disabled"
        :single-select="table.single"
        :show-select="page.nested"
        v-model="selected"
        @click:row="rowClick"
        @update:options="updateOptions"
    >
        <template #progress>
            <v-progress-linear :color="theme" height="1" indeterminate></v-progress-linear>
        </template>

        <template v-slot:[`item.data-table-select`]="{ isSelected, select }">
            <v-simple-checkbox
                :color="theme"
                :value="isSelected"
                @input="select($event)"
                v-ripple
            ></v-simple-checkbox>
        </template>

        <template v-for="(column, columnIndex) in page.headers" #[`item.${column.value}`]="{ item, index }">
            <!-- icon -->
            <v-icon v-if="column.value === 'icon'" :key="columnIndex">
                {{ item.icon }}
            </v-icon>

            <!-- color -->
            <v-icon v-else-if="column.value === 'color'" :key="columnIndex" :color="item.color">gradient</v-icon>

            <!-- visibility -->
            <v-icon v-else-if="column.value === 'visibility'" :key="columnIndex">
                {{ item.visibility === true ? 'visibility' : 'visibility_off' }}
            </v-icon>

            <!-- has nested -->
            <template v-else-if="column.value === 'name' && ('nest_deep' in item)">
                <div class="d-flex align-center" :class="item.nest_deep > 0 ? 'fill-height' : ''" :key="columnIndex">
                    <template v-if="item.nest_deep !== -1">
                        <div class="v-treeview-node__level d-flex align-center fill-height" v-for="(itm, idx) in item.nest_deep" :key="idx">
                            <template v-if="itm < item.nest_deep">
                                <v-divider vertical></v-divider>
                            </template>
                            
                            <template v-if="itm === item.nest_deep">
                                <v-divider vertical></v-divider>
                                <v-divider class="mr-1"></v-divider>
                            </template>
                        </div>
                    </template>
                    <span class="flex-grow-1">{{ item.name }}</span>
                </div>
            </template>

            <slot :name="`item.${column.value}`" :item="item" :index="index" v-else>
                <span v-html="item[column.value]" :key="index" />
            </slot>
        </template>
    </v-data-table>
</template>

<script>
import { mapState } from 'vuex';

export default {
    props: {
        nested: {
            type: Boolean,
            default: false
        }
    },

    computed: {
        ...mapState({
            disabled: state => state.module.records.length > 0 ? false : true,
            page: state => state.module.page,
            records: state => state.module.records,
            table: state => state.module.table,
            theme: state => state.theme,
        }),

        selected: {
            get: function() {
                return this.$store.state.module.page.selected;
            },

            set: function(selected) {
                this.$store.commit('PAGE_SELECTED', selected);
            }
        }
    },

    created() {
        this.$store.commit('MODULE_DATATYPE', 'table');
    },

    methods: {
        rowClick: function(item, { select, isSelected }) {
            select(!isSelected);
        },

        updateOptions: function(options) {
            if (this.page.initialized) {
                this.$store.commit('BUILD_REQUEST_PARAMS', { options: options });
                this.$store.dispatch('fetch_records', { reset: true });
            }
        }
    }
};
</script>