<!-- components/MarkerList.vue -->

<template>
    <div>
        <h2>List of Markers</h2>
        <ul>
            <li v-for="(marker, index) in markers" :key="index">
                {{ marker.name }}
            </li>
        </ul>
    </div>
</template>

<script>
export default {
    props: {
        markers: Array, // Nhận mảng các điểm đánh dấu từ parent component
    },
};
</script>

<style scoped>
/* CSS cho danh sách nếu cần */
</style>
