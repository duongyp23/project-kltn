<template>
    <div class="address-search-container">
        <div class="title">{{ title }}</div>
        <div class="row-input-search">
            <input v-model="searchQuery" placeholder="Nhập địa chỉ" class="input-search" @change="searchPlaces"/>
            <button @click="searchPlaces">Tìm kiếm</button>
        </div>
        <div class="result-search">
            <div v-if="searchResults.length" class="list-result" >
                <div v-for="(result, index) in searchResults" 
                    :key="index" 
                    @click="selectPlace(result)" 
                    @dblclick="addPlace(result)" 
                    class="result-item">
                {{ result.display_name }}
                </div>
            </div>
            <div v-else-if="searching" class="loader"></div>
        </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        searchQuery: '',
            searchResults: [],
        searching: false
      };
    },
    props: {
      title: String,
    },
    methods: {
      searchPlaces() {
				if (this.searchQuery.length > 2) {
  				this.searching = true;
          // Sử dụng API Nominatim của OpenStreetMap để tìm kiếm địa điểm
          axios
            .get(`https://nominatim.openstreetmap.org/search?format=json&q=${this.searchQuery}`)
            .then((response) => {
              this.searchResults = response.data;
            })
            .catch((error) => {
              console.error('Error searching places:', error);
  						})
						.finally(() => {
							this.searching = false;
						});
        } else {
          this.searchResults = [];
        }
      },
      selectPlace(place) {
        // Truyền địa chỉ được chọn đến component MapComponent
        this.$emit('placeSelected', place);
      },
      addPlace(place) {
        // Truyền địa chỉ được chọn đến component MapComponent
        this.$emit('addPlace', place);
        this.searchResults = [];
      },
    },
  };
  </script>
  
  <style scoped>
  .title {
    margin-top: 3px ;
    text-align: left;
    margin-bottom: 5px;
  }
  .address-search-container {
    width: 370px;
    top: 0;
    right: 0;
    background-color: #ffffff; /* Màu nền của phần tìm kiếm */
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); /* Hiển thị shadow để tạo độ sâu */
    display: flex;
    flex-direction: column;
    margin: 10px;
  }
  
  ul {
    list-style: none;
    padding: 0;
  }
  
  li {
    cursor: pointer;
    padding: 8px;
    border: 1px solid #ddd;
    background-color: #f9f9f9;
  }
  
  li:hover {
    background-color: #ddd;
  }
  
  .input-search {
    width: 285px;
    height: 30px;
    border: 1px solid;
    border-radius: 4%;
    margin-right: 5px;
  }

  .result-search {
    margin-top: 5px;
    display: flex;
    flex-direction: column;
    align-items: center;
		max-height: 300px;
  }
  .list-result {
    display: flex;
    flex-direction: column;
    row-gap: 3px;
    height: 100%;
    width: 100%;
    overflow: auto;
  }
  .result-item {
    border: 1px solid;
    text-align: center;
  }
  .loader {
    margin: 30px 0px;
    border: 8px solid #f3f3f3;
    border-top: 8px solid #3498db;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .row-input-search {
    display: flex;
    flex-direction: row;
  }
  
  </style>
  