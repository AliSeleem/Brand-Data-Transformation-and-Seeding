import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IBrand {
	brandName: string;
	yearFounded: number;
	headquarters: string;
	numberOfLocations: number;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface IBrandDocument extends IBrand, Document {}

const brandSchema = new Schema<IBrandDocument>(
	{
		brandName: {
			type: String,
			required: [true, 'Brand name is required'],
			trim: true,
		},
		yearFounded: {
			type: Number,
			required: [true, 'Year founded is required'],
			min: [1600, 'Year founded seems too old'],
			max: [new Date().getFullYear(), 'Year founded cannot be in the future'],
		},
		headquarters: {
			type: String,
			required: [true, 'Headquarters location is required'],
			trim: true,
		},
		numberOfLocations: {
			type: Number,
			required: [true, 'Number of locations is required'],
			min: [1, 'There should be at least one location'],
		},
	},
	{
		timestamps: true,
	},
);

export const Brand: Model<IBrandDocument> = mongoose.model<IBrandDocument>(
	'Brand',
	brandSchema,
);
