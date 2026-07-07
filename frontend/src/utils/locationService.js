export const CAVITE_LOCATIONS = {
  province: 'Cavite',
  citiesAndMunicipalities: [
    { name: 'Alfonso', zipCode: '4123' },
    { name: 'Amadeo', zipCode: '4119' },
    { name: 'Bacoor', zipCode: '4102' },
    { name: 'Carmona', zipCode: '4116' },
    { name: 'Cavite City', zipCode: '4100' },
    { name: 'Dasmariñas', zipCode: '4114' },
    { name: 'General Emilio Aguinaldo', zipCode: '4124' },
    { name: 'General Mariano Alvarez', zipCode: '4117' },
    { name: 'General Trias', zipCode: '4107' },
    { name: 'Imus', zipCode: '4103' },
    { name: 'Indang', zipCode: '4122' },
    { name: 'Kawit', zipCode: '4104' },
    { name: 'Magallanes', zipCode: '4113' },
    { name: 'Maragondon', zipCode: '4112' },
    { name: 'Mendez', zipCode: '4121' },
    { name: 'Molino', zipCode: '4135' },
    { name: 'Naic', zipCode: '4110' },
    { name: 'Noveleta', zipCode: '4105' },
    { name: 'Rosario', zipCode: '4106' },
    { name: 'Silang', zipCode: '4118' },
    { name: 'Tagaytay', zipCode: '4120' },
    { name: 'Tanza', zipCode: '4108' },
    { name: 'Ternate', zipCode: '4111' },
    { name: 'Trece Martires', zipCode: '4109' }
  ].sort((a, b) => a.name.localeCompare(b.name))
};

// Returns an array of available provinces
export const getAvailableProvinces = () => {
  return [CAVITE_LOCATIONS.province];
};

// Returns an array of available cities/municipalities for a given province
export const getLocationsForProvince = (province) => {
  if (province === CAVITE_LOCATIONS.province) {
    return CAVITE_LOCATIONS.citiesAndMunicipalities;
  }
  return [];
};

// Returns the zip code for a given city/municipality within a province
export const getZipCodeForLocation = (province, locationName) => {
  if (province === CAVITE_LOCATIONS.province) {
    const location = CAVITE_LOCATIONS.citiesAndMunicipalities.find(loc => loc.name === locationName);
    return location ? location.zipCode : '';
  }
  return '';
};
