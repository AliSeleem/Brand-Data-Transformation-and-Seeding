import * as mongoose from 'mongoose'
import dotenv from 'dotenv'
import { Brand } from './brands-schema'
import brandsData from './brands.json'
import { faker } from '@faker-js/faker'
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

const fakeBrand = () => {
  const brandName = faker.company.name()
  const yearFounded = faker.number.int({ min: 1600, max: new Date().getFullYear() })
  const headquarters = faker.location.city()
  const numberOfLocations = faker.number.int({ min: 1, max: 10000 })
  return {
    brandName,
    yearFounded,
    headquarters,
    numberOfLocations,
  }
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

  // Update brands
  for (let i = 0; i < brands.length; i++) {
    await Brand.updateOne(
      { _id: brands[i]._id },
      { $set: transformedBrands?.[i] }
    )
  }  console.log("Data after update successfully")

  // Fake brands
  const fakeBrands = []
  for (let i = 0; i < 10; i++) {
    fakeBrands.push(fakeBrand())
  }
  console.log("Fake brands:", fakeBrands)
  await seedBrands(fakeBrands)
  console.log("Fake brands seeded successfully")

  // Brands after transformation and seeding
  const brandsAfterTransformationAndSeeding = await Brand.find()
  console.log("Brands after transformation and seeding:", brandsAfterTransformationAndSeeding)
  return;
}

main()