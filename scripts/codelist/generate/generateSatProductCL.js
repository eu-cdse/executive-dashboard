const xlsx = require('node-xlsx');
const fs = require('fs');

const codelist = 'cl_sat_product';
const codeListItem = {
  key: '',
  name: '',
  mission: '',
  'beam mode': '',
  'product/data type': '',
  'Engineering Level': '',
  resolution: '',
  'processing level': '',
  description: '',
};

const filterUniqueObjects = (objects, key = 'key') => {
  const seen = new Set();
  return objects.filter((obj) => {
    if (!seen.has(obj[key])) {
      seen.add(obj[key]);
      return true;
    }
    return false;
  });
};

const generateNewCodelist = (data, mappedKeys) => {
  const newData = data
    .map((row) => {
      const newItem = { ...codeListItem };
      Object.keys(mappedKeys).forEach((key) => {
        newItem[key] = row[mappedKeys[key]] || '';
      });

      // if 'Engineering level' is defined, group product under 'Engineering'
      // otherwise group products as in 'product/data type'
      newItem['product/data type'] =
        newItem['Engineering Level'] === 'ENG'
          ? 'Engineering'
          : newItem['product/data type'];

      // remove not needed property
      delete newItem['Engineering Level'];

      return newItem;
    })
    .filter((item) => item.key !== '');

  return filterUniqueObjects(newData);
};

const main = async () => {
  const path = `${process.cwd()}/generate`;
  const workSheetsFromFile = xlsx.parse(`${path}/codelists.xlsx`);

  // Get worksheet with data
  const { data } = workSheetsFromFile.find((ws) => ws.name === codelist);

  // Map keys of codeListItem to data keys index
  const clItemKeys = Object.keys(codeListItem);
  const dataKeys = data.splice(0, 1).flat();

  const mappedKeys = {};
  clItemKeys.forEach((key) => {
    const index = dataKeys.indexOf(key);
    if (index !== -1) {
      mappedKeys[key] = index;
    }
  });

  const newCodelist = generateNewCodelist(data, mappedKeys);

  const currentCodelist = require(`${path}/codelist.json`);

  currentCodelist[codelist] = newCodelist;

  fs.writeFileSync(
    `${process.cwd()}/generate/codelist.json`,
    JSON.stringify(currentCodelist, null, 2)
  );
};

main()
  .then(() => {
    console.log('');
  })
  .catch((err) => {
    console.log(err);
  });
