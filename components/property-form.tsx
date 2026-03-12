"use client";
import * as z from "zod";
import { formSchema, PropertyFormValues } from "@/lib/property-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { motion } from "motion/react";
import { Check, X } from "lucide-react";
import {
  Field,
  FieldGroup,
  FieldContent,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldSeparator,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { UploadThingDropzone } from "@/components/uploadthing-dropzone";
import { UploadThingImageGrid, ImageItem } from "@/components/uploadthing-image-grid";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  useCategories,
  useFeatures,
  usePropertyTypes,
  useRentDurations,
  useNearPlaces,
  useWilayas,
  useCities,
} from "@/hooks/use-details";
import { useState, useEffect } from "react";
import { useCreateListing, useUpdateListing } from "@/hooks/use-listings";
import { useAuth } from "@/components/providers/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ListingResource } from "@/api/generated-client";

type Props = {
  type?: "edit"
  listing?: ListingResource
}

export function PropertyForm({ type, listing }: Props) {
  const { data: propertyTypes } = usePropertyTypes();
  const { data: rentDurations } = useRentDurations();
  const { data: features } = useFeatures();
  const { data: nearPlaces } = useNearPlaces();
  const { data: wilayas } = useWilayas();
  
  const [selectedWilaya, setSelectedWilaya] = useState<number | undefined>();
  const { data: cities, isLoading: loadingCities } = useCities(selectedWilaya);
  
  const { mutateAsync: createListing, status: createStatus } = useCreateListing();
  const { mutateAsync: updateListing, status: updateStatus } = useUpdateListing();
  const { user, isLoading: loadingUser } = useAuth();
  const router = useRouter();

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      floor: 0,
      surface: 0,
      boost_level: 0,
      min_duration: 1,
      number_rooms: 0,
      member_id: 1,
      number_persons: 1,
      location: {
        latitude: "",
        longitude: "",
        altitude: "",
        zipCode: "",
        cityId: "",
        address: "",
      },
      is_ready: true,
      is_negotiable: false,
      main_image: "",
      rent_duration_id: 1, 
      type_id: 1, 
      features: [],
      near_places: [],
      images: [],
    },
  });
  const {
    formState: { isSubmitting, isSubmitSuccessful },
    handleSubmit,
    control,
    setValue,
    watch,
    reset
  } = form;

  // Initialize form with listing data for edit mode
  useEffect(() => {
    if (type === 'edit' && listing) {
      // Set selected wilaya to trigger city loading
      

      reset({
        title: listing.title,
        description: listing.description || "",
        price: listing.price,
        floor: listing.floor || 0,
        surface: listing.surface ?? 0,
        boost_level: listing.boostLevel || 0,
        min_duration: listing.minDuration || 1,
        number_rooms: listing.numberRooms || 0,
        member_id: listing.members?.[0]?.id || undefined,
        number_persons: listing.numberPersons || 1,
        location: {
          latitude: listing.location?.latitude,
          longitude: listing.location?.longitude,
          // altitude: listing.location?.altitude || "0",
          zipCode: listing.location?.zipCode || "",
          cityId: listing.location?.city.toString() || "",
          // address: listing.location?.a || "",
        },
        is_ready: listing.isReady || true,
        is_negotiable: listing.isNegotiable || false,
        main_image: listing.image || "",
        rent_duration_id: listing.rentDuration?.id || undefined,
        type_id: listing.type?.id || undefined,
        features: listing.features?.map(f => f.id) || [],
        near_places: listing.nearPlaces?.map(p => p.id) || [],
        images: listing.images?.map(img => img.image) || [],
      });
    }
  }, [type, listing, reset]);


  

  const onSubmit = async (data: PropertyFormValues) => {
    try {
      if (!user) {
        toast.error("You must be logged in to create a listing");
        return;
      }

      // Convert image URLs to Base64 strings
      const convertToBase64 = async (url: string): Promise<string> => {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
            const base64Data = base64String.split(',')[1];
            resolve(base64Data);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      };

      const mainImageBase64 = data.main_image.startsWith("data:") ? data.main_image.split(',')[1] : (data.main_image.startsWith("http") ? await convertToBase64(data.main_image) : data.main_image);
      const imagesBase64 = await Promise.all(data.images.map(async (url) => 
        url.startsWith("data:") ? url.split(',')[1] : (url.startsWith("http") ? await convertToBase64(url) : url)
      ));

      const payload = {
        title: data.title,
        description: data.description,
        price: data.price,
        surface: data.surface,
        mainImage: mainImageBase64, // Send Base64 directly
        memberId: (user && 'id' in user ? user.id : 1), 
        rentDurationId: data.rent_duration_id,
        typeId: data.type_id,
        location: {
          latitude: data.location.latitude,
          longitude: data.location.longitude,
          altitude: data.location.altitude || "0",
          zipCode: data.location.zipCode,
          cityId: parseInt(data.location.cityId),
          address: data.location.address
        },
        floor: data.floor,
        boostLevel: data.boost_level,
        minDuration: data.min_duration,
        numberRooms: data.number_rooms,
        numberPersons: data.number_persons,
        isReady: data.is_ready,
        isNegotiable: data.is_negotiable,
        features: data.features,
        nearPlaces: data.near_places,
        images: imagesBase64, // Send Base64 directly
        categories: [] // Add categories if needed
      };

      if (type === 'edit' && listing) {
        // @ts-ignore
        await updateListing({ id: listing.id, data: payload });
        toast.success("Listing updated successfully!");
      } else {
        // @ts-ignore
        await createListing(payload);
        toast.success("Listing created successfully!");
      }

      router.push("/dashboard/my-listings");
      // form.reset(); 
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(type === 'edit' ? "Failed to update listing." : "Failed to create listing. Please try again.");
    }
  };

  if (createStatus === "success" || updateStatus === "success") {
    return (
      <div className="p-2 sm:p-5 md:p-8 w-full rounded-md gap-2 border">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, stiffness: 300, damping: 25 }}
          className="h-full py-6 px-3"
        >
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.3,
              type: "spring",
              stiffness: 500,
              damping: 15,
            }}
            className="mb-4 flex justify-center border rounded-full w-fit mx-auto p-2"
          >
            <Check className="size-8" />
          </motion.div>
          <h2 className="text-center text-2xl text-pretty font-bold mb-2">
            Success!
          </h2>
          <p className="text-center text-lg text-pretty text-muted-foreground">
            Property listed successfully.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-2 sm:p-5 md:p-8 w-full rounded-md gap-2 border max-w-4xl mx-auto bg-white"
    >
      <FieldGroup className="space-y-8">
        {/* Section 1: Media Gallery */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">1</span>
            <h3 className="font-semibold text-xl tracking-tight">Media Gallery</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Controller
              name="main_image"
              control={control}
              render={({ field, fieldState }) => (
                <div className="col-span-1">
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Main Cover Image</FieldLabel>
                    <UploadThingDropzone
                      onSelect={(files) => {
                        // TODO: Implement actual upload
                        // For now, just simulating setting the value
                        const fakeUrl = URL.createObjectURL(files[0]);
                        field.onChange(fakeUrl);
                      }}
                      accept="image/png, image/jpeg, image/gif"
                      maxFiles={1}
                      maxSize={5242880}
                    />
                    {field.value && (
                      <div className="mt-2 relative aspect-video rounded-lg overflow-hidden border">
                        <img src={field.value} alt="Main cover" className="object-cover w-full h-full" />
                        <button
                          type="button"
                          onClick={() => field.onChange("")}
                          className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                </div>
              )}
            />

            <Controller
              name="images"
              control={control}
              render={({ field, fieldState }) => (
                <div className="col-span-1">
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Property Gallery</FieldLabel>
                    <UploadThingImageGrid
                      value={field.value.map((url, index) => ({ id: index.toString(), url }))}
                      onChange={(images) => field.onChange(images.map(img => img.url))}
                      onUpload={async (files) => {
                        // TODO: Implement actual upload
                        // Simulating upload
                        return files.map((file, index) => ({
                          id: Math.random().toString(),
                          url: URL.createObjectURL(file),
                          name: file.name
                        }));
                      }}
                      maxImages={10}
                    />
                    <FieldDescription>
                      Add up to 10 photos of the interior and exterior.
                    </FieldDescription>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                </div>
              )}
            />
          </div>
        </div>

        <FieldSeparator />

        {/* Section 2: Basic Information */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">2</span>
            <h3 className="font-semibold text-xl tracking-tight">Basic Information</h3>
          </div>

          <div className="grid gap-4">
            <Controller
              name="title"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="title">Property Title</FieldLabel>
                  <Input
                    {...field}
                    id="title"
                    placeholder="e.g. Luxurious 3BR Villa with Sea View"
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="description">Description</FieldLabel>
                  <Textarea
                    {...field}
                    id="description"
                    placeholder="Describe the key features and selling points of your property..."
                    className="min-h-25"
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <Controller
                name="type_id"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="type_id">Property Type</FieldLabel>
                    <Select 
                      value={field.value?.toString()} 
                      onValueChange={(val) => field.onChange(parseInt(val))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {propertyTypes?.map((type) => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                name="rent_duration_id"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="rent_duration_id">Rent Type</FieldLabel>
                    <Select 
                      value={field.value?.toString()} 
                      onValueChange={(val) => field.onChange(parseInt(val))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        {rentDurations?.map((duration) => (
                          <SelectItem key={duration.id} value={duration.id.toString()}>
                            {duration.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>
          </div>
        </div>

        <FieldSeparator />

        {/* Section 3: Specifications */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">3</span>
            <h3 className="font-semibold text-xl tracking-tight">Specifications</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Controller
              name="floor"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="floor">Floor No.</FieldLabel>
                  <Input
                    {...field}
                    id="floor"
                    type="number"
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="surface"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="surface">Surface (m²)</FieldLabel>
                  <Input
                    {...field}
                    id="surface"
                    type="number"
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="number_rooms"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="number_rooms">Rooms</FieldLabel>
                  <Input
                    {...field}
                    id="number_rooms"
                    type="number"
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="number_persons"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="number_persons">Capacity</FieldLabel>
                  <Input
                    {...field}
                    id="number_persons"
                    type="number"
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </div>
        </div>

        <FieldSeparator />

        {/* Section 4: Pricing & Availability */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">4</span>
            <h3 className="font-semibold text-xl tracking-tight">Pricing & Availability</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
               <Controller
                name="price"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="price">Price (DZD)</FieldLabel>
                    <Input
                      {...field}
                      id="price"
                      type="number"
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <Controller
                name="min_duration"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="min_duration">Min. Duration (Days)</FieldLabel>
                    <Input
                      {...field}
                      id="min_duration"
                      type="number"
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>

            <div className="space-y-6 pt-6">
              <Controller
                name="is_ready"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_ready" className="text-base">Is Ready to Move?</Label>
                    <Switch
                      id="is_ready"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                )}
              />

              <Controller
                name="is_negotiable"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_negotiable" className="text-base">Price is Negotiable?</Label>
                    <Switch
                      id="is_negotiable"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                )}
              />
            </div>
          </div>
        </div>

        <FieldSeparator />

        {/* Section 5: Features & Amenities */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">5</span>
            <h3 className="font-semibold text-xl tracking-tight">Features & Amenities</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features?.map((feature) => (
              <Controller
                key={feature.id}
                name="features"
                control={control}
                render={({ field }) => {
                  return (
                    <div className="flex items-center space-x-2 border rounded-md p-3">
                      <Checkbox
                        id={`feature-${feature.id}`}
                        checked={field.value?.includes(feature.id)}
                        onCheckedChange={(checked) => {
                          return checked
                            ? field.onChange([...(field.value || []), feature.id])
                            : field.onChange(
                                field.value?.filter(
                                  (value) => value !== feature.id
                                )
                              );
                        }}
                      />
                      <Label htmlFor={`feature-${feature.id}`} className="cursor-pointer text-sm font-normal">
                        {feature.name}
                      </Label>
                    </div>
                  );
                }}
              />
            ))}
          </div>
        </div>

        <FieldSeparator />

        {/* Section 6: Location & Surroundings */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">6</span>
            <h3 className="font-semibold text-xl tracking-tight">Location & Surroundings</h3>
          </div>

          <div className="space-y-6">
            <div>
              <FieldLabel className="mb-3 block">Nearby Points of Interest</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {nearPlaces?.map((place) => (
                  <Controller
                    key={place.id}
                    name="near_places"
                    control={control}
                    render={({ field }) => (
                      <div 
                        onClick={() => {
                          const checked = field.value?.includes(place.id);
                          return !checked
                            ? field.onChange([...(field.value || []), place.id])
                            : field.onChange(
                                field.value?.filter((value) => value !== place.id)
                              );
                        }}
                        className={`
                          cursor-pointer px-4 py-2 rounded-full text-sm border transition-colors
                          ${field.value?.includes(place.id) 
                            ? "bg-blue-600 text-white border-blue-600" 
                            : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300"
                          }
                        `}
                      >
                        {place.name}
                      </div>
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Wilaya</Label>
                <Select
                  value={selectedWilaya?.toString()}
                  onValueChange={(val) => setSelectedWilaya(parseInt(val))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Wilaya" />
                  </SelectTrigger>
                  <SelectContent>
                    {wilayas?.wilayas?.map((w) => (
                      <SelectItem key={w.id} value={w.id.toString()}>
                        {w.id} - {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Controller
                name="location.cityId"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>City</FieldLabel>
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(val) => field.onChange(val)}
                      disabled={!selectedWilaya || loadingCities}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select City" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities?.cities?.map((city) => (
                          <SelectItem key={city.id} value={city.id.toString()}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Field>
                  <FieldLabel>Street Address</FieldLabel>
                  <Input placeholder="Start typing address..." />
                </Field>
                {/* Map placeholder */}
                <div className="aspect-video bg-zinc-100 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-400">
                  Map View Placeholder
                </div>
              </div>
            </div>
          </div>
        </div>

      </FieldGroup>

      <div className="mt-8 flex justify-end items-center gap-4 pt-4 border-t">
        <Button variant="ghost" type="button" disabled={isSubmitting}>
          Save as Draft
        </Button>
        <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white min-w-35">
          {isSubmitting ? "Publishing..." : "Publish Property"}
        </Button>
      </div>
    </form>
  );
}
