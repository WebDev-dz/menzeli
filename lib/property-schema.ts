import * as z from "zod";
import { ListingsStoreRequest } from "@/api";
import { ListingResource } from '../api/models/ListingResource';
import { urlToFile } from './utils';

const fileSchema = z.any();
 
fileSchema.check(
  z.minSize(10_000), // minimum .size (bytes)
  z.maxSize(1_000_000), // maximum .size (bytes)
  z.mime(["image/png", "image/jpeg"])
);



export const formSchema: z.ZodType<ListingsStoreRequest, ListingsStoreRequest> = z.object({
  title: z.string().min(1, "Title is required"),
  price: z.number().min(0, "Price must be positive"),
  surface: z.number().positive("Surface must be positive"),
  mainImage: fileSchema,                       // Blob <- File
  rentDurationId: z.number().int().positive("Rent duration is required"),
  typeId: z.number().int().positive("Property type is required"),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    zipCode: z.string().nullable().optional(),
    cityId: z.number(),
  }),
  description: z.string().min(1, "Description is required").nullable().optional(),
  floor: z.number().int().min(0).nullable().optional(),
  boostLevel: z.number().int().nullable().optional(),
  minDuration: z.number().int().positive().nullable().optional(),
  numberRooms: z.number().int().min(0).nullable().optional(),
  numberPersons: z.number().int().min(1).nullable().optional(),
  isReady: z.boolean().optional(),
  isNegotiable: z.boolean().optional(),
  categories: z.array(z.number()).nullable().optional(),
  features: z.array(z.number()).nullable().optional(),
  nearPlaces: z.array(z.number()).nullable().optional(),
  images: z.array(fileSchema).nullable().optional(),
});


export const defaultProperty = {
      title: "",
      description: "",
      price: 25000,
      floor: 0,
      surface: 300,
      boostLevel: 0,
      minDuration: 10,
      numberRooms: 10,
      numberPersons: 1,
      location: {
        latitude: 35.826752,
        longitude: -0.2299,
        altitude: 0,
        zipCode: "1000",
        cityId: 1,
      },
      isReady: true,
      isNegotiable: false,
      rentDurationId: 1,
      typeId: 1,
      features: [],
      nearPlaces: [],
      images: [],
    }


export const ListingToForm = async (listing: ListingResource) : Promise<ListingsStoreRequest> => ({
          title: listing.title,
          description: listing.description || "",
          price: listing.price,
          floor: listing.floor || 0,
          surface: listing.surface ?? 0,
          boostLevel:  0,
          minDuration: listing.minDuration || 1,
          numberRooms: listing.numberRooms || 0,
          numberPersons: listing.numberPersons || 1,
          location: {
            latitude: Number(listing.location?.latitude),
            longitude: Number(listing.location?.longitude),
            zipCode: listing.location?.zipCode || null,
            cityId: 0
          },
          isReady: listing.isReady || true,
          isNegotiable: listing.isNegotiable || false,
          mainImage: await urlToFile(listing.image) || null,
          rentDurationId: listing.rentDuration?.id || 1,
          typeId: listing.type?.id || 1,
          features: listing.features?.map((f) => f.id) || [],
          nearPlaces: listing.nearPlaces?.map((p) => p.id) || [],
          images: await Promise.all(listing.images?.map((i) => urlToFile(i.image)) || []) || [],
        })

export type PropertyFormValues = z.infer<typeof formSchema>;