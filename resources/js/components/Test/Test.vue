
<template>
    <div>
        <p>Test component</p>
        <DataTable
            :data="data"
            class="table table-striped"
            :options="dataTableOptions"
        >
            <thead class="table-dark">
                <tr>
                    <th>A</th>
                    <th>B</th>
                </tr>
            </thead>
        </DataTable>
    </div>
</template>
<script>
export default {
    data() {
        return {
            data: [
                [1, 2],
                [3, 4],
            ],
        };
    },
};
</script>
