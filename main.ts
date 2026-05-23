import * as mongoose from 'mongoose'
import dotenv from 'dotenv'
import { Brand } from './brands-schema'
import brandsData from './brands.json'
import { faker } from '@faker-js/faker'
import * as XLSX from 'xlsx'
import path from 'path'
import fs from 'fs'

dotenv.config()

const connection = () => mongoose.connect(process.env.MONGO_URI || '').then(() => {
    console.log('Connected to MongoDB')
}).catch((err) => {
    console.log(err)
})

const seedBrands = async (brands: any) => {
  try {
    for (const brand of brands) {
      const newBrand = new Brand(brand)
      await newBrand.save()
    }
  } catch (err) {
    console.log(err)
  }
}

const exportToExcel = (data: any[], fileName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Brands')

  const filePath = path.join(process.cwd(), fileName)
  XLSX.writeFile(workbook, filePath)

  console.log(`Excel file created: ${filePath}`)
}

const exportToJson = (data: unknown[], fileName: string) => {
  const filePath = path.join(process.cwd(), fileName)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
  console.log(`JSON file created: ${filePath}`)
}

const fakeBrands = () => {
  const brands = []
  const currentYear = new Date().getFullYear()

  brands.push({
    case: 1,
    description: 'Minimum allowed values',
    difference: 'Lower boundary: year 1600, 1 location',
    brandName: faker.company.name(),
    yearFounded: 1600,
    headquarters: faker.location.city(),
    numberOfLocations: 1,
  })

  brands.push({
    case: 2,
    description: 'Maximum allowed year',
    difference: 'Upper boundary: founded this year',
    brandName: faker.company.name(),
    yearFounded: currentYear,
    headquarters: faker.location.city(),
    numberOfLocations: faker.number.int({ min: 1, max: 50 }),
  })

  brands.push({
    case: 3,
    description: 'Large-scale enterprise',
    difference: 'Very high location count',
    brandName: faker.company.name(),
    yearFounded: faker.number.int({ min: 1600, max: currentYear }),
    headquarters: faker.location.city(),
    numberOfLocations: 10000,
  })

  brands.push({
    case: 4,
    description: 'Small local business',
    difference: 'Single location, recent founding',
    brandName: faker.company.name(),
    yearFounded: faker.number.int({ min: 2010, max: currentYear }),
    headquarters: faker.location.city(),
    numberOfLocations: 1,
  })

  brands.push({
    case: 5,
    description: 'Historic brand',
    difference: 'Founded in the 19th century',
    brandName: faker.company.name(),
    yearFounded: 1850,
    headquarters: faker.location.city(),
    numberOfLocations: faker.number.int({ min: 10, max: 100 }),
  })

  brands.push({
    case: 6,
    description: 'Mid-size regional chain',
    difference: 'Moderate location count',
    brandName: faker.company.name(),
    yearFounded: faker.number.int({ min: 1950, max: 2000 }),
    headquarters: faker.location.city(),
    numberOfLocations: 250,
  })

  brands.push({
    case: 7,
    description: 'National chain',
    difference: 'Thousands of locations',
    brandName: faker.company.name(),
    yearFounded: faker.number.int({ min: 1600, max: 1990 }),
    headquarters: faker.location.city(),
    numberOfLocations: 5000,
  })

  brands.push({
    case: 8,
    description: 'Just above minimum boundaries',
    difference: 'Year 1601, 2 locations',
    brandName: faker.company.name(),
    yearFounded: 1601,
    headquarters: faker.location.city(),
    numberOfLocations: 2,
  })

  brands.push({
    case: 9,
    description: '20th-century established brand',
    difference: 'Mid-range year and locations',
    brandName: faker.company.name(),
    yearFounded: 1975,
    headquarters: faker.location.city(),
    numberOfLocations: 500,
  })

  brands.push({
    case: 10,
    description: 'Fully randomized valid brand',
    difference: 'All fields from faker within schema limits',
    brandName: faker.company.name(),
    yearFounded: faker.number.int({ min: 1600, max: currentYear }),
    headquarters: faker.location.city(),
    numberOfLocations: faker.number.int({ min: 1, max: 9999 }),
  })

  return brands
}

const transformBrands = async (brands: any) => {
  const transformedBrands = []
  try {
    for (const brand of brands) {
      const yearFounded = Number(brand.yearFounded ?? brand.yearsFounded ?? brand.yearCreated)
      const transformedBrand = {
        brandName: brand.brandName ?? brand.brand.name,
        yearFounded: yearFounded && yearFounded > 1600 ? yearFounded : 1600,
        headquarters: brand.headquarters || brand.hqAddress,
        numberOfLocations: Number(brand.numberOfLocations) || 1,
      }
      await Brand.validate(transformedBrand)
      transformedBrands.push(transformedBrand)
    }
    return transformedBrands
  } catch (err) {
    console.log(err)
  }
}

const main = async () => {
  await connection()
  const brands = await Brand.find()
  console.log("Data before transformation:", brands)
  const transformedBrands = await transformBrands(brandsData)
  console.log("Data after transformation:", transformedBrands)

  for (let i = 0; i < brands.length; i++) {
    await Brand.replaceOne(
      { _id: brands[i]._id },
      transformedBrands?.[i]
    )
  }

  console.log('Data after update successfully')

  const fakeBrandsData = fakeBrands()

  exportToExcel(fakeBrandsData, 'brands.xlsx')

  const fakeBrandsForDb = fakeBrandsData.map((brand) => ({
    brandName: brand.brandName,
    yearFounded: brand.yearFounded,
    headquarters: brand.headquarters,
    numberOfLocations: brand.numberOfLocations,
  }))

  await seedBrands(fakeBrandsForDb)

  console.log('Fake brands seeded successfully')

  const finalBrands = await Brand.find().lean()
  exportToJson(finalBrands, 'brands-export.json')

  console.log('Final brands exported successfully')

  await mongoose.disconnect()
}

main()