// script.js

// Utility to capitalize first letter
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

// Fetch breeds and populate the select dropdown
const populateBreedOptions = async () => {
  try {
    const response = await fetch("https://dog.ceo/api/breeds/list/all");
    const data = await response.json();
    const breeds = data.message;
    const breedSelect = document.getElementById("breedSelect");

    for (const breed in breeds) {
      const breedOption = document.createElement("option");
      breedOption.value = capitalize(breed);
      breedOption.textContent = capitalize(breed);
      breedSelect.appendChild(breedOption);
    }
  } catch (error) {
    console.error("Error fetching breeds:", error);
  }
};

// Fetch images based on breed and number of images
const fetchImages = async (breed, numImages) => {
  if (!breed || numImages <= 0) return;

  try {
    const formattedBreed = breed.toLowerCase().replace(/ /g, "-");
    const response = await fetch(
      `https://dog.ceo/api/breed/${formattedBreed}/images/random/${numImages}`
    );
    const data = await response.json();

    if (data.status === "success") {
      const imageGallery = document.getElementById("imageGallery");
      imageGallery.innerHTML = "";
      data.message.forEach((image) => {
        const img = document.createElement("img");
        img.src = image;
        img.alt = `Dog breed ${breed}`;
        imageGallery.appendChild(img);
      });
    } else {
      console.error("Failed to fetch images");
    }
  } catch (error) {
    console.error("Error fetching images:", error);
  }
};

// Handle form submission
const handleFormSubmit = (event) => {
  event.preventDefault();

  const breed = document.getElementById("breedSelect").value;
  const numImages = parseInt(document.getElementById("numImages").value, 10);

  if (!breed || numImages < 1) {
    console.log("No breed selected or number of images is less than 1");
    return;
  }

  document.getElementById("breedName").textContent = breed;
  fetchImages(breed, numImages);
};

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  populateBreedOptions();
  document
    .getElementById("breedForm")
    .addEventListener("submit", handleFormSubmit);
});
