// src/data/eventData.js

const genresList = ["Rock", "Metal", "Alternative Rock", "Punk"]; // Only the genres you have in your concerts

const orderByOptions = ["Date", "Price", "Location"]; // Removed "Popularity" as it's not present

const countries = [
    "UK",
    "Germany",
    "USA",
    "Sweden", // Stockholm
    "Brazil", // Sao Paulo
    "Japan", // Tokyo
];

const cities = {
    UK: ["London", "Manchester"],
    Germany: ["Berlin"],
    USA: ["New Orleans", "Los Angeles", "Seattle", "Detroit", "Austin", "Portland"],
    Sweden: ["Stockholm"],
    Brazil: ["Sao Paulo"],
    Japan: ["Tokyo"],
};

export { genresList, orderByOptions, countries, cities };

