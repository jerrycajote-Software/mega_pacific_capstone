import axios from 'axios';

export const PLANT_ORIGIN = {
  name: 'Mega Pacific Imus Plant',
  address: 'Imus, Cavite',
  city: 'Imus',
  province: 'Cavite'
};

// Distance matrix from Imus, Cavite to CALABARZON cities (one-way km)
export const CALABARZON_DISTANCES = {
  'Cavite': {
    'Imus': { km: 5, toll: 0 },
    'Bacoor': { km: 8, toll: 0 },
    'Kawit': { km: 8, toll: 0 },
    'Noveleta': { km: 10, toll: 0 },
    'Cavite City': { km: 14, toll: 0 },
    'Rosario': { km: 12, toll: 0 },
    'General Trias': { km: 14, toll: 0 },
    'Dasmariñas': { km: 11, toll: 0 },
    'Tanza': { km: 17, toll: 0 },
    'Trece Martires': { km: 22, toll: 0 },
    'Carmona': { km: 22, toll: 0 },
    'Silang': { km: 24, toll: 0 },
    'Naic': { km: 28, toll: 0 },
    'Amadeo': { km: 30, toll: 0 },
    'Indang': { km: 30, toll: 0 },
    'Tagaytay': { km: 36, toll: 0 },
    'Mendez': { km: 38, toll: 0 },
    'Maragondon': { km: 36, toll: 0 },
    'Ternate': { km: 38, toll: 0 },
    'Alfonso': { km: 42, toll: 0 },
    'General Emilio Aguinaldo': { km: 44, toll: 0 },
    'Magallanes': { km: 48, toll: 0 },
    'General Mariano Alvarez': { km: 18, toll: 0 }
  },
  'Laguna': {
    'San Pedro': { km: 22, toll: 0 },
    'Biñan': { km: 25, toll: 0 },
    'Santa Rosa': { km: 28, toll: 0 },
    'Cabuyao': { km: 35, toll: 150 },
    'Calamba': { km: 42, toll: 200 },
    'Los Baños': { km: 55, toll: 200 },
    'Bay': { km: 62, toll: 200 },
    'Alaminos': { km: 68, toll: 200 },
    'San Pablo': { km: 72, toll: 250 },
    'Calauan': { km: 70, toll: 200 },
    'Victoria': { km: 78, toll: 200 },
    'Pila': { km: 82, toll: 200 },
    'Santa Cruz': { km: 88, toll: 200 },
    'Magdalena': { km: 92, toll: 200 },
    'Liliw': { km: 95, toll: 200 },
    'Nagcarlan': { km: 90, toll: 200 },
    'Majayjay': { km: 98, toll: 200 },
    'Luisiana': { km: 105, toll: 200 },
    'Cavinti': { km: 100, toll: 200 },
    'Pagsanjan': { km: 92, toll: 200 },
    'Lumban': { km: 95, toll: 200 },
    'Kalayaan': { km: 100, toll: 200 },
    'Paete': { km: 105, toll: 200 },
    'Pakil': { km: 108, toll: 200 },
    'Pangil': { km: 112, toll: 200 },
    'Siniloan': { km: 115, toll: 200 },
    'Famy': { km: 118, toll: 200 },
    'Mabitac': { km: 115, toll: 200 },
    'Santa Maria': { km: 120, toll: 200 },
    'Rizal': { km: 85, toll: 200 }
  },
  'Batangas': {
    'Santo Tomas': { km: 52, toll: 220 },
    'Tanauan': { km: 58, toll: 260 },
    'Malvar': { km: 64, toll: 300 },
    'Talisay': { km: 50, toll: 0 },
    'Laurel': { km: 58, toll: 0 },
    'Lipa': { km: 75, toll: 380 },
    'Lipa City': { km: 75, toll: 380 },
    'Mataasnakahoy': { km: 75, toll: 380 },
    'Balete': { km: 78, toll: 380 },
    'San Jose': { km: 80, toll: 420 },
    'Cuenca': { km: 82, toll: 420 },
    'Alitagtag': { km: 85, toll: 420 },
    'Santa Teresita': { km: 88, toll: 420 },
    'San Nicolas': { km: 82, toll: 0 },
    'Taal': { km: 78, toll: 0 },
    'Lemery': { km: 80, toll: 0 },
    'Agoncillo': { km: 75, toll: 0 },
    'San Pascual': { km: 88, toll: 480 },
    'Bauan': { km: 90, toll: 480 },
    'Batangas City': { km: 92, toll: 520 },
    'Ibaan': { km: 85, toll: 450 },
    'Rosario': { km: 88, toll: 450 },
    'Padre Garcia': { km: 84, toll: 450 },
    'San Juan': { km: 100, toll: 480 },
    'Taysan': { km: 98, toll: 480 },
    'Lobo': { km: 115, toll: 480 },
    'Tuy': { km: 68, toll: 0 },
    'Balayan': { km: 75, toll: 0 },
    'Calaca': { km: 72, toll: 0 },
    'Lian': { km: 82, toll: 0 },
    'Nasugbu': { km: 78, toll: 0 },
    'Calatagan': { km: 105, toll: 0 },
    'Mabini': { km: 98, toll: 480 },
    'Tingloy': { km: 105, toll: 480 }
  },
  'Rizal': {
    'Cainta': { km: 38, toll: 180 },
    'Taytay': { km: 40, toll: 180 },
    'San Mateo': { km: 48, toll: 180 },
    'Antipolo': { km: 46, toll: 180 },
    'Angono': { km: 42, toll: 180 },
    'Binangonan': { km: 48, toll: 180 },
    'Teresa': { km: 52, toll: 180 },
    'Morong': { km: 56, toll: 180 },
    'Cardona': { km: 54, toll: 180 },
    'Baras': { km: 60, toll: 180 },
    'Tanay': { km: 65, toll: 180 },
    'Pililla': { km: 72, toll: 180 },
    'Jalajala': { km: 85, toll: 180 },
    'Rodriguez': { km: 54, toll: 180 }
  },
  'Quezon': {
    'Tiaong': { km: 80, toll: 280 },
    'San Antonio': { km: 85, toll: 280 },
    'Candelaria': { km: 92, toll: 320 },
    'Dolores': { km: 88, toll: 300 },
    'Sariaya': { km: 102, toll: 350 },
    'Tayabas': { km: 110, toll: 350 },
    'Lucena': { km: 115, toll: 380 },
    'Pagbilao': { km: 125, toll: 380 },
    'Lucban': { km: 105, toll: 320 },
    'Sampaloc': { km: 118, toll: 320 },
    'Mauban': { km: 130, toll: 350 },
    'Real': { km: 110, toll: 200 },
    'Infanta': { km: 120, toll: 200 },
    'General Nakar': { km: 125, toll: 200 },
    'Atimonan': { km: 145, toll: 380 },
    'Plaridel': { km: 155, toll: 380 },
    'Padre Burgos': { km: 140, toll: 380 },
    'Agdangan': { km: 150, toll: 380 },
    'Unisan': { km: 160, toll: 380 },
    'Pitogo': { km: 170, toll: 380 },
    'Macalelon': { km: 180, toll: 380 },
    'General Luna': { km: 185, toll: 380 },
    'Catanauan': { km: 195, toll: 380 },
    'Mulanay': { km: 215, toll: 380 },
    'San Francisco': { km: 235, toll: 380 },
    'San Andres': { km: 250, toll: 380 },
    'San Narciso': { km: 245, toll: 380 },
    'Buenavista': { km: 260, toll: 380 },
    'Gumaca': { km: 165, toll: 380 },
    'Lopez': { km: 185, toll: 380 },
    'Calauag': { km: 200, toll: 380 },
    'Guinayangan': { km: 215, toll: 380 },
    'Tagkawayan': { km: 230, toll: 380 },
    'Alabat': { km: 170, toll: 380 },
    'Perez': { km: 170, toll: 380 },
    'Polillo': { km: 140, toll: 200 }
  }
};

export const PROVINCE_FALLBACKS = {
  'Cavite': { km: 20, toll: 0 },
  'Laguna': { km: 55, toll: 200 },
  'Batangas': { km: 75, toll: 380 },
  'Rizal': { km: 50, toll: 180 },
  'Quezon': { km: 120, toll: 350 }
};

export const VEHICLE_RULES = [
  {
    type: 'Elf 6-Wheeler',
    code: 'ELF',
    kl: 7,
    manpower: 1900,
    depreciation: 2000,
    maxBedLength: 6.0,
    maxBedWeight: 5.0,
    maxTopLength: 12.0,
    maxTopWeight: 4.0,
    tlaTiers: [
      { minLength: 0, maxLength: 6.0, tla: 0, loadType: 'Bed Load' },
      { minLength: 6.01, maxLength: 9.0, tla: 1000, loadType: 'Top Load (7.0M to 9.0M)' },
      { minLength: 9.01, maxLength: 12.0, tla: 2000, loadType: 'Top Load (9.01M to 12M)' }
    ]
  },
  {
    type: 'Forward 6-Wheeler',
    code: 'FORWARD',
    kl: 5,
    manpower: 2100,
    depreciation: 3000,
    maxBedLength: 8.0,
    maxBedWeight: 8.0,
    maxTopLength: 16.0,
    maxTopWeight: 4.0,
    tlaTiers: [
      { minLength: 0, maxLength: 8.0, tla: 0, loadType: 'Bed Load' },
      { minLength: 8.01, maxLength: 13.0, tla: 2000, loadType: 'Top Load (9.01M to 13M)' },
      { minLength: 13.01, maxLength: 16.0, tla: 3000, loadType: 'Top Load (13.1M to 16M)' }
    ]
  },
  {
    type: '10-Wheeler Drop-side',
    code: '10W_DROPSIDE',
    kl: 3,
    manpower: 2200,
    depreciation: 6000,
    maxBedLength: 9.0,
    maxBedWeight: 25.0,
    maxTopLength: 21.0,
    maxTopWeight: 2.5,
    tlaTiers: [
      { minLength: 0, maxLength: 9.0, tla: 0, loadType: 'Bed Load' },
      { minLength: 9.01, maxLength: 15.0, tla: 4000, loadType: 'Top Load (10M to 15M)' },
      { minLength: 15.01, maxLength: 21.0, tla: 6000, loadType: 'Top Load (16M to 21M)' },
      { minLength: 21.01, maxLength: 26.0, tla: 8000, loadType: 'Top Load (>21M Custom)' }
    ]
  },
  {
    type: 'Tractor Head w/ Trailer',
    code: 'TRACTOR_HEAD',
    kl: 2,
    manpower: 3600,
    depreciation: 12000,
    maxBedLength: 12.0,
    maxBedWeight: 40.0,
    maxTopLength: 26.0,
    maxTopWeight: 40.0,
    tlaTiers: [
      { minLength: 0, maxLength: 12.0, tla: 0, loadType: 'Bed Load' },
      { minLength: 12.01, maxLength: 26.0, tla: 8000, loadType: 'Trailer Load (Custom Rigging)' }
    ]
  }
];

export const getDistanceForCity = (province, city) => {
  if (!province || !city) return { km: 20, toll: 0 };
  const provData = CALABARZON_DISTANCES[province];
  if (provData) {
    const foundKey = Object.keys(provData).find(k => k.toLowerCase() === city.toLowerCase());
    if (foundKey) return provData[foundKey];
  }
  return PROVINCE_FALLBACKS[province] || { km: 25, toll: 0 };
};

export const computeClientDeliveryFee = ({
  province,
  city,
  items = [],
  dieselPrice = 105.00,
  adminCostPct = 20.0,
  includeDepreciation = true
}) => {
  const dest = getDistanceForCity(province, city);
  const oneWayKm = dest.km;
  const roundTripKm = oneWayKm * 2;
  const tollFee = dest.toll || 0;

  let longestPanelLength = 5.0;
  let totalWeightKg = 0;

  if (Array.isArray(items) && items.length > 0) {
    items.forEach(item => {
      const qty = parseInt(item.quantity) || 1;
      let itemLength = 5.0;
      if (item.length && parseFloat(item.length) > 0) {
        itemLength = parseFloat(item.length);
      } else {
        const text = `${item.variant?.name || item.variantName || ''} ${item.product?.name || item.name || ''}`;
        const match = text.match(/(\d+(?:\.\d+)?)\s*(?:m\b|meter|meters)/i);
        if (match) itemLength = parseFloat(match[1]);
      }
      if (itemLength > longestPanelLength) longestPanelLength = itemLength;

      if (item.weight && parseFloat(item.weight) > 0) {
        totalWeightKg += parseFloat(item.weight) * qty;
      } else {
        totalWeightKg += itemLength * 4.0 * qty;
      }
    });
  } else {
    totalWeightKg = 500;
  }

  const totalWeightMt = Math.max(0.1, totalWeightKg / 1000);

  let chosenVehicle = VEHICLE_RULES[0];
  let loadType = 'Bed Load';
  let isBedLoad = true;
  let tla = 0;

  for (const v of VEHICLE_RULES) {
    if (longestPanelLength <= v.maxBedLength && totalWeightMt <= v.maxBedWeight) {
      chosenVehicle = v;
      loadType = 'Bed Load';
      isBedLoad = true;
      tla = 0;
      break;
    }
    if (longestPanelLength <= v.maxTopLength && totalWeightMt <= v.maxTopWeight) {
      chosenVehicle = v;
      isBedLoad = false;
      const tier = v.tlaTiers.find(t => longestPanelLength >= t.minLength && longestPanelLength <= t.maxLength) || v.tlaTiers[v.tlaTiers.length - 1];
      loadType = tier.loadType;
      tla = tier.tla;
      break;
    }
  }

  const fuelLiters = roundTripKm / chosenVehicle.kl;
  const fuelCost = Math.round(fuelLiters * dieselPrice * 100) / 100;
  const manpower = chosenVehicle.manpower;
  const vehicleDepreciation = includeDepreciation ? chosenVehicle.depreciation : 0;
  const subtotal = fuelCost + manpower + tla + vehicleDepreciation;
  const adminCost = Math.round(subtotal * (adminCostPct / 100) * 100) / 100;
  const total = Math.round((subtotal + adminCost + tollFee) * 100) / 100;

  return {
    origin: PLANT_ORIGIN,
    destination: { province, city, distanceKm: oneWayKm, roundTripKm },
    vehicleType: chosenVehicle.type,
    loadType,
    isBedLoad,
    parameters: { longestPanelLength, totalWeightMt, dieselPrice, adminCostPct },
    breakdown: {
      kilometersTravelled: roundTripKm,
      fuelLiters: Math.round(fuelLiters * 100) / 100,
      fuelCost,
      manpower,
      topLoadAdditional: tla,
      vehicleDepreciation,
      subtotal,
      adminCost,
      tollFee,
      totalDeliveryCharge: total
    },
    totalDeliveryCharge: total
  };
};

// API Fetcher for real-time computed delivery fee from backend
export const fetchDeliveryFee = async ({ province, city, items = [] }) => {
  try {
    const API_URL = import.meta.env.VITE_API_URL || '';
    const res = await axios.post(`${API_URL}/api/customer/orders/calculate-shipping`, {
      province,
      city,
      items: items.map(item => ({
        productId: item.product?.id || item.productId,
        variantId: item.variant?.id || item.variantId,
        variantName: item.variant?.name || item.variantName,
        name: item.product?.name || item.name,
        quantity: item.quantity || 1,
        length: item.length,
        weight: item.weight
      }))
    });

    if (res.data.success && res.data.data) {
      return res.data.data;
    }
  } catch (error) {
    console.warn('[DELIVERY CALCULATOR] Remote API fallback to client calculator:', error.message);
  }

  // Fallback to client-side formula if backend is unreachable
  return computeClientDeliveryFee({ province, city, items });
};
