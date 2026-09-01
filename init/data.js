const mongoose = require("mongoose");

const sampleListings = [
  {
    title: "Luxury Beach Villa in Goa",
    description: "A beautiful luxury villa with modern interiors, private pool and stunning views. Perfect for a relaxing vacation.",
    image: {
      url: "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?auto=format&fit=crop&w=1200&q=80",
      filename: "luxury-beach-villa-in-goa"
    },
    price: 7500,
    location: "Goa",
    country: "India",
    category: "Beach",
    geometry: {
      type: "Point",
      coordinates: [74.124, 15.2993]
    }
  },

  {
    title: "Cozy Cottage in Manali",
    description: "A charming wooden cottage nestled in the mountains, offering breathtaking views of snow-capped peaks.",
    image: {
      url: "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1200&q=80",
      filename: "cozy-cottage-in-manali"
    },
    price: 4200,
    location: "Manali",
    country: "India",
    category: "Mountain",
    geometry: {
      type: "Point",
      coordinates: [77.1892, 32.2432]
    }
  },

  {
    title: "Houseboat Stay in Alleppey",
    description: "Experience the serene backwaters of Kerala aboard a traditional houseboat with all modern amenities.",
    image: {
      url: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80",
      filename: "houseboat-stay-in-alleppey"
    },
    price: 6000,
    location: "Alleppey",
    country: "India",
    category: "Surfing",
    geometry: {
      type: "Point",
      coordinates: [76.3388, 9.4981]
    }
  },

  {
    title: "Heritage Haveli in Jaipur",
    description: "A royal haveli converted into a boutique stay, showcasing Rajasthani architecture and hospitality.",
    image: {
      url: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80",
      filename: "heritage-haveli-in-jaipur"
    },
    price: 5500,
    location: "Jaipur",
    country: "India",
    category: "Castles",
    geometry: {
      type: "Point",
      coordinates: [75.7873, 26.9124]
    }
  },

  {
    title: "Treehouse Retreat in Wayanad",
    description: "Sleep among the treetops in this eco-friendly treehouse surrounded by lush greenery.",
    image: {
      url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
      filename: "treehouse-retreat-in-wayanad"
    },
    price: 3800,
    location: "Wayanad",
    country: "India",
    category: "Trending",
    geometry: {
      type: "Point",
      coordinates: [76.132, 11.6854]
    }
  },

  {
    title: "Modern Apartment in Mumbai",
    description: "A sleek city apartment with skyline views, ideal for business travelers and city explorers.",
    image: {
      url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      filename: "modern-apartment-in-mumbai"
    },
    price: 8200,
    location: "Mumbai",
    country: "India",
    category: "Iconic Cities",
    geometry: {
      type: "Point",
      coordinates: [72.8777, 19.076]
    }
  },

  {
    title: "Riverside Cabin in Rishikesh",
    description: "A peaceful cabin by the Ganges, perfect for yoga retreats and spiritual getaways.",
    image: {
      url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200&q=80",
      filename: "riverside-cabin-in-rishikesh"
    },
    price: 3200,
    location: "Rishikesh",
    country: "India",
    category: "Farms",
    geometry: {
      type: "Point",
      coordinates: [78.2676, 30.0869]
    }
  },

  {
    title: "Desert Camp in Jaisalmer",
    description: "Luxury tented accommodation amidst the golden dunes of the Thar Desert.",
    image: {
      url: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1200&q=80",
      filename: "desert-camp-in-jaisalmer"
    },
    price: 4700,
    location: "Jaisalmer",
    country: "India",
    category: "Camping",
    geometry: {
      type: "Point",
      coordinates: [70.9083, 26.9157]
    }
  },

  {
    title: "Hill Station Bungalow in Ooty",
    description: "A colonial-era bungalow surrounded by tea gardens and misty hills.",
    image: {
      url: "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1200&q=80",
      filename: "hill-station-bungalow-in-ooty"
    },
    price: 4400,
    location: "Ooty",
    country: "India",
    category: "Mountain",
    geometry: {
      type: "Point",
      coordinates: [76.695, 11.4064]
    }
  },

  {
    title: "Beachfront Cottage in Gokarna",
    description: "Wake up to the sound of waves in this simple yet stylish beach cottage.",
    image: {
      url: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?auto=format&fit=crop&w=1200&q=80",
      filename: "beachfront-cottage-in-gokarna"
    },
    price: 3600,
    location: "Gokarna",
    country: "India",
    category: "Beach",
    geometry: {
      type: "Point",
      coordinates: [74.32, 14.5479]
    }
  },

  {
    title: "Lakeview Villa in Udaipur",
    description: "An elegant villa overlooking Lake Pichola with private balconies and royal charm.",
    image: {
      url: "https://images.unsplash.com/photo-1505873242700-f289a29e1e0f?auto=format&fit=crop&w=1200&q=80",
      filename: "lakeview-villa-in-udaipur"
    },
    price: 9000,
    location: "Udaipur",
    country: "India",
    category: "Amazing Pools",
    geometry: {
      type: "Point",
      coordinates: [73.7125, 24.5854]
    }
  },

  {
    title: "Farmstay in Coorg",
    description: "A working coffee plantation offering an authentic rural experience with organic meals.",
    image: {
      url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
      filename: "farmstay-in-coorg"
    },
    price: 2900,
    location: "Coorg",
    country: "India",
    category: "Farms",
    geometry: {
      type: "Point",
      coordinates: [75.7382, 12.3375]
    }
  },

  {
    title: "Snow Chalet in Gulmarg",
    description: "A cozy alpine chalet perfect for skiing enthusiasts and snow lovers.",
    image: {
      url: "https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=1200&q=80",
      filename: "snow-chalet-in-gulmarg"
    },
    price: 6800,
    location: "Gulmarg",
    country: "India",
    category: "Mountain",
    geometry: {
      type: "Point",
      coordinates: [74.3805, 34.0484]
    }
  },

  {
    title: "Boutique Studio in Bangalore",
    description: "A minimalist studio apartment in the heart of India's tech capital.",
    image: {
      url: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80",
      filename: "boutique-studio-in-bangalore"
    },
    price: 4100,
    location: "Bangalore",
    country: "India",
    category: "Iconic Cities",
    geometry: {
      type: "Point",
      coordinates: [77.5946, 12.9716]
    }
  },

  {
    title: "Coastal Villa in Pondicherry",
    description: "French colonial architecture meets beachfront luxury in this charming villa.",
    image: {
      url: "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=1200&q=80",
      filename: "coastal-villa-in-pondicherry"
    },
    price: 5200,
    location: "Pondicherry",
    country: "India",
    category: "Beach",
    geometry: {
      type: "Point",
      coordinates: [79.8083, 11.9416]
    }
  },

  {
    title: "Dome Stay in Spiti Valley",
    description: "Geodesic dome accommodation offering stargazing views in the high-altitude desert.",
    image: {
      url: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=1200&q=80",
      filename: "dome-stay-in-spiti-valley"
    },
    price: 5000,
    location: "Spiti Valley",
    country: "India",
    category: "Camping",
    geometry: {
      type: "Point",
      coordinates: [78.0322, 32.2461]
    }
  },

  {
    title: "Luxury Resort in Andaman",
    description: "Beachfront luxury with crystal-clear waters and private cabanas.",
    image: {
      url: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1200&q=80",
      filename: "luxury-resort-in-andaman"
    },
    price: 11000,
    location: "Port Blair",
    country: "India",
    category: "Amazing Pools",
    geometry: {
      type: "Point",
      coordinates: [92.7265, 11.6234]
    }
  },

  {
    title: "Tea Estate Bungalow in Munnar",
    description: "A colonial planter's bungalow set amidst rolling tea plantations.",
    image: {
      url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
      filename: "tea-estate-bungalow-in-munnar"
    },
    price: 4600,
    location: "Munnar",
    country: "India",
    category: "Farms",
    geometry: {
      type: "Point",
      coordinates: [77.0595, 10.0889]
    }
  },

  {
    title: "City Loft in Delhi",
    description: "A stylish loft apartment close to Delhi's historic monuments and markets.",
    image: {
      url: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80",
      filename: "city-loft-in-delhi"
    },
    price: 5300,
    location: "Delhi",
    country: "India",
    category: "Iconic Cities",
    geometry: {
      type: "Point",
      coordinates: [77.1025, 28.7041]
    }
  },

  {
    title: "Beach Shack in Varkala",
    description: "A rustic beach shack perched on the cliffs overlooking the Arabian Sea.",
    image: {
      url: "https://images.unsplash.com/photo-1544984243-ec57ea16fe25?auto=format&fit=crop&w=1200&q=80",
      filename: "beach-shack-in-varkala"
    },
    price: 2800,
    location: "Varkala",
    country: "India",
    category: "Beach",
    geometry: {
      type: "Point",
      coordinates: [76.7163, 8.7379]
    }
  },

  {
    title: "Mountain Lodge in Leh",
    description: "A traditional Ladakhi homestay with panoramic views of the Himalayas.",
    image: {
      url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80",
      filename: "mountain-lodge-in-leh"
    },
    price: 4900,
    location: "Leh",
    country: "India",
    category: "Mountain",
    geometry: {
      type: "Point",
      coordinates: [77.5771, 34.1526]
    }
  },

  {
    title: "Private Island Villa in Maldives",
    description: "An overwater villa with direct lagoon access and unmatched privacy.",
    image: {
      url: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1200&q=80",
      filename: "private-island-villa-in-maldives"
    },
    price: 25000,
    location: "Malé",
    country: "Maldives",
    category: "Amazing Pools",
    geometry: {
      type: "Point",
      coordinates: [73.5093, 4.1755]
    }
  },

  {
    title: "Santorini Cliffside Villa",
    description: "Whitewashed walls and blue domes with sweeping views of the Aegean Sea.",
    image: {
      url: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80",
      filename: "santorini-cliffside-villa"
    },
    price: 18000,
    location: "Santorini",
    country: "Greece",
    category: "Iconic Cities",
    geometry: {
      type: "Point",
      coordinates: [25.4615, 36.3932]
    }
  },

  {
    title: "Swiss Alps Chalet",
    description: "A timber chalet surrounded by snow-capped peaks, ideal for winter sports.",
    image: {
      url: "https://images.unsplash.com/photo-1518623489648-a173ef7824f3?auto=format&fit=crop&w=1200&q=80",
      filename: "swiss-alps-chalet"
    },
    price: 15500,
    location: "Zermatt",
    country: "Switzerland",
    category: "Mountain",
    geometry: {
      type: "Point",
      coordinates: [7.7491, 46.0207]
    }
  },

  {
    title: "Tuscan Countryside Villa",
    description: "A rustic Italian farmhouse surrounded by vineyards and olive groves.",
    image: {
      url: "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1200&q=80",
      filename: "tuscan-countryside-villa"
    },
    price: 13000,
    location: "Tuscany",
    country: "Italy",
    category: "Farms",
    geometry: {
      type: "Point",
      coordinates: [11.2558, 43.7711]
    }
  },

  {
    title: "Parisian Apartment near Eiffel Tower",
    description: "A chic apartment with iconic views of the Eiffel Tower.",
    image: {
      url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
      filename: "parisian-apartment-near-eiffel-tower"
    },
    price: 14500,
    location: "Paris",
    country: "France",
    category: "Iconic Cities",
    geometry: {
      type: "Point",
      coordinates: [2.3522, 48.8566]
    }
  },

  {
    title: "Bali Jungle Villa",
    description: "A private villa surrounded by tropical rainforest with an infinity pool.",
    image: {
      url: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80",
      filename: "bali-jungle-villa"
    },
    price: 7200,
    location: "Ubud",
    country: "Indonesia",
    category: "Trending",
    geometry: {
      type: "Point",
      coordinates: [115.2624, -8.5069]
    }
  },

  {
    title: "New York City Penthouse",
    description: "A luxurious penthouse with skyline views of Manhattan.",
    image: {
      url: "https://images.unsplash.com/photo-1522083165195-3424ed129620?auto=format&fit=crop&w=1200&q=80",
      filename: "new-york-city-penthouse"
    },
    price: 22000,
    location: "New York",
    country: "USA",
    category: "Iconic Cities",
    geometry: {
      type: "Point",
      coordinates: [-74.006, 40.7128]
    }
  },

  {
    title: "Norwegian Fjord Cabin",
    description: "A remote wooden cabin overlooking dramatic fjords and waterfalls.",
    image: {
      url: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80",
      filename: "norwegian-fjord-cabin"
    },
    price: 9800,
    location: "Bergen",
    country: "Norway",
    category: "Mountain",
    geometry: {
      type: "Point",
      coordinates: [5.3221, 60.3913]
    }
  },

  {
    title: "Dubai Desert Resort",
    description: "Luxury desert camp with private plunge pools under the stars.",
    image: {
      url: "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=80",
      filename: "dubai-desert-resort"
    },
    price: 16000,
    location: "Dubai",
    country: "UAE",
    category: "Camping",
    geometry: {
      type: "Point",
      coordinates: [55.2708, 25.2048]
    }
  },

  {
    title: "Scottish Highland Castle",
    description: "A historic stone castle offering a regal countryside escape.",
    image: {
      url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      filename: "scottish-highland-castle"
    },
    price: 12000,
    location: "Inverness",
    country: "Scotland",
    category: "Castles",
    geometry: {
      type: "Point",
      coordinates: [-4.2247, 57.4778]
    }
  },

  {
    title: "Amazon Rainforest Lodge",
    description: "An eco-lodge deep in the Amazon offering wildlife encounters.",
    image: {
      url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80",
      filename: "amazon-rainforest-lodge"
    },
    price: 8600,
    location: "Manaus",
    country: "Brazil",
    category: "Farms",
    geometry: {
      type: "Point",
      coordinates: [-60.0217, -3.119]
    }
  },

  {
    title: "Kyoto Traditional Ryokan",
    description: "A serene Japanese inn with tatami rooms and a private onsen.",
    image: {
      url: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1200&q=80",
      filename: "kyoto-traditional-ryokan"
    },
    price: 9500,
    location: "Kyoto",
    country: "Japan",
    category: "Rooms",
    geometry: {
      type: "Point",
      coordinates: [135.7681, 35.0116]
    }
  },

  {
    title: "Sydney Harbour Apartment",
    description: "A modern apartment with views of the Opera House and harbour bridge.",
    image: {
      url: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80",
      filename: "sydney-harbour-apartment"
    },
    price: 13500,
    location: "Sydney",
    country: "Australia",
    category: "Iconic Cities",
    geometry: {
      type: "Point",
      coordinates: [151.2093, -33.8688]
    }
  },

  {
    title: "Icelandic Glass Igloo",
    description: "Watch the Northern Lights from bed in this glass-roofed igloo.",
    image: {
      url: "https://images.unsplash.com/photo-1517783999520-f068d7431a60?auto=format&fit=crop&w=1200&q=80",
      filename: "icelandic-glass-igloo"
    },
    price: 17500,
    location: "Reykjavik",
    country: "Iceland",
    category: "Rooms",
    geometry: {
      type: "Point",
      coordinates: [-21.9426, 64.1466]
    }
  },

  {
    title: "Moroccan Riad in Marrakech",
    description: "A traditional riad with an interior courtyard pool and ornate tilework.",
    image: {
      url: "https://images.unsplash.com/photo-1548019865-9f100e1a4d0e?auto=format&fit=crop&w=1200&q=80",
      filename: "moroccan-riad-in-marrakech"
    },
    price: 6300,
    location: "Marrakech",
    country: "Morocco",
    category: "Trending",
    geometry: {
      type: "Point",
      coordinates: [-7.9811, 31.6295]
    }
  },

  {
    title: "Cape Town Cliffside Villa",
    description: "A modern villa perched above the Atlantic with panoramic ocean views.",
    image: {
      url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
      filename: "cape-town-cliffside-villa"
    },
    price: 14200,
    location: "Cape Town",
    country: "South Africa",
    category: "Trending",
    geometry: {
      type: "Point",
      coordinates: [18.4241, -33.9249]
    }
  },

  {
    title: "Thai Floating Bungalow",
    description: "A stilted bungalow over turquoise waters in a hidden lagoon.",
    image: {
      url: "https://images.unsplash.com/photo-1552733407-5d5c46c3bf65?auto=format&fit=crop&w=1200&q=80",
      filename: "thai-floating-bungalow"
    },
    price: 5400,
    location: "Krabi",
    country: "Thailand",
    category: "Surfing",
    geometry: {
      type: "Point",
      coordinates: [98.9063, 8.0863]
    }
  },

  {
    title: "Costa Rican Rainforest Treehouse",
    description: "An elevated treehouse surrounded by dense jungle canopy.",
    image: {
      url: "https://images.unsplash.com/photo-1520637836862-4d197d17c93a?auto=format&fit=crop&w=1200&q=80",
      filename: "costa-rican-rainforest-treehouse"
    },
    price: 7100,
    location: "Monteverde",
    country: "Costa Rica",
    category: "Trending",
    geometry: {
      type: "Point",
      coordinates: [-84.8203, 10.3181]
    }
  },

  {
    title: "Greek Island Boat House",
    description: "A converted fishing boat house docked in a quiet harbor.",
    image: {
      url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",
      filename: "greek-island-boat-house"
    },
    price: 6700,
    location: "Mykonos",
    country: "Greece",
    category: "Surfing",
    geometry: {
      type: "Point",
      coordinates: [25.3289, 37.4467]
    }
  },

  {
    title: "Patagonian Wilderness Cabin",
    description: "A remote cabin at the edge of glaciers and pristine lakes.",
    image: {
      url: "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=1200&q=80",
      filename: "patagonian-wilderness-cabin"
    },
    price: 8300,
    location: "El Chaltén",
    country: "Argentina",
    category: "Mountain",
    geometry: {
      type: "Point",
      coordinates: [-72.888, -49.3308]
    }
  },

  {
    title: "Provence Lavender Farmhouse",
    description: "A stone farmhouse surrounded by fragrant lavender fields.",
    image: {
      url: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80",
      filename: "provence-lavender-farmhouse"
    },
    price: 7900,
    location: "Provence",
    country: "France",
    category: "Farms",
    geometry: {
      type: "Point",
      coordinates: [5.4474, 43.9352]
    }
  },

  {
    title: "Bangkok Rooftop Condo",
    description: "A stylish high-rise condo with rooftop pool and city skyline views.",
    image: {
      url: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80",
      filename: "bangkok-rooftop-condo"
    },
    price: 6100,
    location: "Bangkok",
    country: "Thailand",
    category: "Iconic Cities",
    geometry: {
      type: "Point",
      coordinates: [100.5018, 13.7563]
    }
  },

  {
    title: "Canadian Rockies Log Cabin",
    description: "A handcrafted log cabin nestled among pine forests and mountains.",
    image: {
      url: "https://images.unsplash.com/photo-1518602164578-cd0074062767?auto=format&fit=crop&w=1200&q=80",
      filename: "canadian-rockies-log-cabin"
    },
    price: 8700,
    location: "Banff",
    country: "Canada",
    category: "Mountain",
    geometry: {
      type: "Point",
      coordinates: [-115.5708, 51.1784]
    }
  },

  {
    title: "Sahara Desert Dome Camp",
    description: "Sleep under the stars in a luxury dome camp in the dunes.",
    image: {
      url: "https://images.unsplash.com/photo-1509023464722-18d996393ca8?auto=format&fit=crop&w=1200&q=80",
      filename: "sahara-desert-dome-camp"
    },
    price: 9200,
    location: "Merzouga",
    country: "Morocco",
    category: "Camping",
    geometry: {
      type: "Point",
      coordinates: [-4.0088, 31.1]
    }
  },

  {
    title: "Portuguese Cliffside Villa",
    description: "A whitewashed villa overlooking the dramatic Algarve coastline.",
    image: {
      url: "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?auto=format&fit=crop&w=1200&q=80",
      filename: "portuguese-cliffside-villa"
    },
    price: 10800,
    location: "Algarve",
    country: "Portugal",
    category: "Beach",
    geometry: {
      type: "Point",
      coordinates: [-8.2245, 37.0179]
    }
  },

  {
    title: "Vietnamese Rice Terrace Homestay",
    description: "A traditional stilt house overlooking emerald rice terraces.",
    image: {
      url: "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1200&q=80",
      filename: "vietnamese-rice-terrace-homestay"
    },
    price: 3400,
    location: "Sapa",
    country: "Vietnam",
    category: "Farms",
    geometry: {
      type: "Point",
      coordinates: [103.844, 22.3364]
    }
  },

  {
    title: "Finnish Lakeside Sauna Cabin",
    description: "A minimalist cabin with a private lakeside sauna and dock.",
    image: {
      url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80",
      filename: "finnish-lakeside-sauna-cabin"
    },
    price: 7600,
    location: "Lakeland",
    country: "Finland",
    category: "Mountain",
    geometry: {
      type: "Point",
      coordinates: [26.9459, 61.9241]
    }
  },

  {
    title: "Peruvian Andes Mountain Lodge",
    description: "A cozy lodge with views of terraced Andean peaks near Machu Picchu.",
    image: {
      url: "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1200&q=80",
      filename: "peruvian-andes-mountain-lodge"
    },
    price: 6900,
    location: "Cusco",
    country: "Peru",
    category: "Mountain",
    geometry: {
      type: "Point",
      coordinates: [-71.9675, -13.5319]
    }
  },

  {
    title: "Balearic Island Sea Cave Villa",
    description: "A cliffside villa with a private cove and natural sea cave access.",
    image: {
      url: "https://images.unsplash.com/photo-1543731068-7e0f5beff43a?auto=format&fit=crop&w=1200&q=80",
      filename: "balearic-island-sea-cave-villa"
    },
    price: 19500,
    location: "Ibiza",
    country: "Spain",
    category: "Amazing Pools",
    geometry: {
      type: "Point",
      coordinates: [1.4206, 38.9067]
    }
  }
];

module.exports = { data: sampleListings };