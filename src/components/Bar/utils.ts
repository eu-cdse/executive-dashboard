/**
 * @param productDataType "product/data type" from "cl_sat_product" from codelist.json
 * @returns formatted "product/data type" with additional description which is used in bar chart tooltip title
 */
export const formatBarChartTooltipTitle = (productDataType) => {
  switch (productDataType) {
    // Sentinel-3
    case 'POD':
      return `${productDataType} (Precise Orbit Determination)`;
    // Sentinel-5P
    case 'L1B RA':
      return `${productDataType} (Sentinel-5 Precursor Level 1B Radiances)`;
    case 'L1B IR':
      return `${productDataType} (Sentinel-5 Precursor Level 1B Irradiances)`;
    case 'L2 NPP CLOUD':
      return `${productDataType} (Sentinel-5 Precursor Level 2 NPP Cloud)`;
    case 'L2 O3_PR':
      return `${productDataType} (Sentinel-5 Precursor Level 2 Ozone Profile)`;
    case 'L2 O3_TCL':
      return `${productDataType} (Sentinel-5 Precursor Level 2 Tropospheric Ozone)`;
    case 'L2 HCHO':
      return `${productDataType} (Sentinel-5 Precursor Level 2 Formaldehyde)`;
    case 'L2 CLOUD':
      return `${productDataType} (Sentinel-5 Precursor Level 2 Cloud)`;
    case 'L2 AER_LH':
      return `${productDataType} (Sentinel-5 Precursor Level 2 Aerosol Layer Height)`;
    case 'L2 NO2':
      return `${productDataType} (Sentinel-5 Precursor Level 2 Nitrogen Dioxide)`;
    case 'L2 CO':
      return `${productDataType} (Sentinel-5 Precursor Level 2 Carbon Monoxide)`;
    case 'L2 AER_AI':
      return `${productDataType} (Sentinel-5 Precursor Level 2 Ultraviolet Aerosol Index)`;
    case 'L2 O3':
      return `${productDataType} (Sentinel-5 Precursor Level 2 Ozone)`;
    case 'L2 SO2':
      return `${productDataType} (Sentinel-5 Precursor Level 2 Sulphur Dioxide)`;
    case 'L2 CH4':
      return `${productDataType} (Sentinel-5 Precursor Level 2 Methane)`;
    case 'L2 AER':
      return `${productDataType} (Sentinel-5 Precursor AER)`;
    case 'L2 FRESCO':
      return `${productDataType} (Sentinel-5 Precursor FRESCO cloud support product)`;
    default:
      return productDataType;
  }
};
