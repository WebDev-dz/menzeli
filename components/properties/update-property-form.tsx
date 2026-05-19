"use client";
 
 import { defaultProperty, formSchema, ListingToForm, PropertyFormValues } from "@/lib/property-schema";
 import { zodResolver } from "@hookform/resolvers/zod";
 import { useForm, Controller } from "react-hook-form";
 import { motion } from "motion/react";
 import { Check, Loader2 } from "lucide-react";
 import {
   Field,
   FieldGroup,
   FieldLabel,
   FieldDescription,
   FieldError,
   FieldSeparator,
 } from "@/components/ui/field";
 import { Button } from "@/components/ui/button";
 import { UploadThingDropzone } from "@/components/uploadthing-dropzone";
 import { UploadThingImageGrid } from "@/components/uploadthing-image-grid";
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
   useFeatures,
   usePropertyTypes,
   useRentDurations,
   useNearPlaces,
   useWilayas,
   useCities,
 } from "@/hooks/use-details";
 import { useEffect, useMemo, useState } from "react";
 import { useUpdateMemberListing } from "@/hooks/use-member-listings";
 import { useAuth } from "@/components/providers/auth";
 import { toast } from "sonner";
 import { fileToUrl } from "@/lib/utils";
 import { useTranslation } from "react-i18next";
 import LocationPicker from "../location-picker";
 import type { DTOResponse, ListingResourceDetails } from "@/hooks/use-listings";
 
 export type PropertyFormLocale = "ar" | "en" | "fr";
 
 type PropertyFormBaseProps = {
   locale: PropertyFormLocale;
   mode: "create" | "update";
   defaultValues: PropertyFormValues;
   initialSelectedWilaya?: number;
   listingCityName?: string;
   isSuccess: boolean;
   onSubmit: (data: PropertyFormValues) => Promise<void>;
 };
 
 export function PropertyFormBase({
   locale,
   mode,
   defaultValues,
   initialSelectedWilaya,
   listingCityName,
   isSuccess,
   onSubmit,
 }: PropertyFormBaseProps) {
   const { t } = useTranslation("property-form");
   const { data: propertyTypes } = usePropertyTypes({ locale });
   const { data: rentDurations } = useRentDurations({ locale, type: 0 });
   const { data: features } = useFeatures({ locale });
   const { data: nearPlaces } = useNearPlaces({ locale });
   const { data: wilayas } = useWilayas({ locale });
 
   const [selectedWilaya, setSelectedWilaya] = useState<number | undefined>(
     initialSelectedWilaya,
   );
 
   const {
     data: cities,
     isLoading: loadingCities,
   } = useCities(selectedWilaya, locale);
 
   const form = useForm<PropertyFormValues>({
     resolver: zodResolver(formSchema),
     defaultValues,
   });
 
   const {
     formState: { isSubmitting },
     handleSubmit,
     control,
     reset,
     setValue,
   } = form;
 
   useEffect(() => {
     reset(defaultValues);
   }, [defaultValues, reset]);
 
   useEffect(() => {
     if (!selectedWilaya || !cities || !listingCityName) return;
     const city = cities?.cities?.find((c) => c.name === listingCityName);
     if (!city?.id) return;
     setValue("location.cityId", city.id, { shouldValidate: true });
   }, [selectedWilaya, cities, listingCityName, setValue]);
 
   if (isSuccess) {
     return (
       <div className="w-full gap-2 rounded-md border p-2 sm:p-5 md:p-8">
         <motion.div
           initial={{ opacity: 0, y: -16 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.4, stiffness: 300, damping: 25 }}
           className="h-full px-3 py-6"
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
             className="mx-auto mb-4 flex w-fit justify-center rounded-full border p-2"
           >
             <Check className="size-8" />
           </motion.div>
           <h2 className="mb-2 text-center text-2xl font-bold text-pretty">
             {t("success_title")}
           </h2>
           <p className="text-center text-lg text-muted-foreground text-pretty">
             {t("success_message")}
           </p>
         </motion.div>
       </div>
     );
   }
 
   const handleError = () => {
     toast.error(mode === "update" ? t("error_update") : t("error_create"));
   };
 
   return (
     <form
       onSubmit={handleSubmit(onSubmit, handleError)}
       className="mx-auto w-full gap-2 rounded-md border bg-white p-2 sm:p-5 md:p-8"
     >
       <FieldGroup className="space-y-8">
         <div>
           <div className="mb-4 flex items-center gap-2">
             <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
               1
             </span>
             <h3 className="text-xl font-semibold tracking-tight">
               {t("media_gallery")}
             </h3>
           </div>
 
           <div className="grid gap-6 md:grid-cols-2">
             <Controller
               name="mainImage"
               control={control}
               render={({ field, fieldState }) => (
                 <div className="col-span-1">
                   <Field data-invalid={fieldState.invalid}>
                     <FieldLabel>{t("main_cover_image")}</FieldLabel>
                     <UploadThingDropzone
                       onSelect={(files) => {
                         field.onChange(files?.length ? files[0] : null);
                       }}
                       file={field.value as File}
                       accept="image/png, image/jpeg, image/gif"
                       maxFiles={1}
                       maxSize={5242880}
                     />
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
                     <FieldLabel>{t("property_gallery")}</FieldLabel>
                     <UploadThingImageGrid
                      value={((field.value ?? []) as File[]).map(
                        (file, index) => ({
                          id: index.toString(),
                          file,
                          url: fileToUrl(file),
                        }),
                      )}
                       onChange={(images) =>
                         field.onChange(images.map((img) => img.file))
                       }
                       onUpload={async (files) => {
                         form.setValue("images", files);
                         return files.map((file, index) => ({
                           id: index.toString(),
                          url: fileToUrl(file),
                           file,
                         }));
                       }}
                       maxImages={10}
                     />
                     <FieldDescription>{t("property_gallery_desc")}</FieldDescription>
                     <FieldError errors={[fieldState.error]} />
                   </Field>
                 </div>
               )}
             />
           </div>
         </div>
 
         <FieldSeparator />
 
         <div>
           <div className="mb-4 flex items-center gap-2">
             <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
               2
             </span>
             <h3 className="text-xl font-semibold tracking-tight">
               {t("basic_information")}
             </h3>
           </div>
 
           <div className="grid gap-4">
             <Controller
               name="title"
               control={control}
               render={({ field, fieldState }) => (
                 <Field data-invalid={fieldState.invalid}>
                   <FieldLabel htmlFor="title">{t("property_title")}</FieldLabel>
                   <Input
                     {...field}
                     id="title"
                     placeholder={t("property_title_placeholder")}
                   />
                   <FieldError errors={[fieldState.error]} />
                 </Field>
               )}
             />
 
             <Controller
               name="description"
               control={control}
               render={({ field: { value, ...rest }, fieldState }) => (
                 <Field data-invalid={fieldState.invalid}>
                   <FieldLabel htmlFor="description">{t("description")}</FieldLabel>
                   <Textarea
                     value={value || ""}
                     {...rest}
                     id="description"
                     placeholder={t("description_placeholder")}
                     className="min-h-25"
                   />
                   <FieldError errors={[fieldState.error]} />
                 </Field>
               )}
             />
 
             <div className="grid gap-4 md:grid-cols-2">
               <Controller
                 name="typeId"
                 control={control}
                 render={({ field, fieldState }) => (
                   <Field data-invalid={fieldState.invalid}>
                     <FieldLabel htmlFor="typeId">{t("property_type")}</FieldLabel>
                     <Select
                       value={field.value?.toString()}
                       onValueChange={(val) => field.onChange(parseInt(val))}
                     >
                       <SelectTrigger>
                         <SelectValue placeholder={t("select_type")} />
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
                 name="rentDurationId"
                 control={control}
                 render={({ field, fieldState }) => (
                   <Field data-invalid={fieldState.invalid}>
                     <FieldLabel htmlFor="rent_duration_id">{t("rent_type")}</FieldLabel>
                     <Select
                       value={field.value?.toString()}
                       onValueChange={(val) => field.onChange(parseInt(val))}
                     >
                       <SelectTrigger>
                         <SelectValue placeholder={t("select_duration")} />
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
 
         <div>
           <div className="mb-4 flex items-center gap-2">
             <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
               3
             </span>
             <h3 className="text-xl font-semibold tracking-tight">{t("specifications")}</h3>
           </div>
 
           <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
             <Controller
               name="floor"
               control={control}
               render={({ field: { value, onChange, ...rest }, fieldState }) => (
                 <Field data-invalid={fieldState.invalid}>
                   <FieldLabel htmlFor="floor">{t("floor_no")}</FieldLabel>
                   <Input
                     value={typeof value === "number" ? value.toString() : ""}
                     id="floor"
                     type="number"
                     onChange={(e) => onChange(e.target.valueAsNumber)}
                     {...rest}
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
                   <FieldLabel htmlFor="surface">{t("surface")}</FieldLabel>
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
               name="numberRooms"
               control={control}
               render={({ field: { value, onChange, ...rest }, fieldState }) => (
                 <Field data-invalid={fieldState.invalid}>
                   <FieldLabel htmlFor="numberRooms">{t("rooms")}</FieldLabel>
                   <Input
                     value={typeof value === "number" ? value.toString() : ""}
                     id="numberRooms"
                     type="number"
                     onChange={(e) => onChange(e.target.valueAsNumber)}
                     {...rest}
                   />
                   <FieldError errors={[fieldState.error]} />
                 </Field>
               )}
             />
 
             <Controller
               name="numberPersons"
               control={control}
               render={({ field: { value, onChange, ...rest }, fieldState }) => (
                 <Field data-invalid={fieldState.invalid}>
                   <FieldLabel htmlFor="numberPersons">{t("capacity")}</FieldLabel>
                   <Input
                     value={typeof value === "number" ? value.toString() : ""}
                     id="numberPersons"
                     type="number"
                     onChange={(e) => onChange(e.target.valueAsNumber)}
                     {...rest}
                   />
                   <FieldError errors={[fieldState.error]} />
                 </Field>
               )}
             />
           </div>
         </div>
 
         <FieldSeparator />
 
         <div>
           <div className="mb-4 flex items-center gap-2">
             <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
               4
             </span>
             <h3 className="text-xl font-semibold tracking-tight">
               {t("pricing_availability")}
             </h3>
           </div>
 
           <div className="grid items-start gap-6 md:grid-cols-2">
             <div className="space-y-4">
               <Controller
                 name="price"
                 control={control}
                 render={({ field, fieldState }) => (
                   <Field data-invalid={fieldState.invalid}>
                     <FieldLabel htmlFor="price">{t("price")}</FieldLabel>
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
                 name="minDuration"
                 control={control}
                 render={({ field: { value, onChange, ...rest }, fieldState }) => (
                   <Field data-invalid={fieldState.invalid}>
                     <FieldLabel htmlFor="min_duration">{t("min_duration")}</FieldLabel>
                     <Input
                       value={typeof value === "number" ? value.toString() : ""}
                       id="minDuration"
                       type="number"
                       onChange={(e) => onChange(e.target.valueAsNumber)}
                       {...rest}
                     />
                     <FieldError errors={[fieldState.error]} />
                   </Field>
                 )}
               />
             </div>
 
             <div className="space-y-6 pt-6">
               <Controller
                 name="isReady"
                 control={control}
                 render={({ field }) => (
                   <div className="flex items-center justify-between">
                     <Label htmlFor="is_ready" className="text-base">
                       {t("is_ready")}
                     </Label>
                     <Switch
                       id="isReady"
                       checked={!!field.value}
                       onCheckedChange={field.onChange}
                     />
                   </div>
                 )}
               />
 
               <Controller
                 name="isNegotiable"
                 control={control}
                 render={({ field }) => (
                   <div className="flex items-center justify-between">
                     <Label htmlFor="is_negotiable" className="text-base">
                       {t("is_negotiable")}
                     </Label>
                     <Switch
                       id="is_negotiable"
                       checked={!!field.value}
                       onCheckedChange={field.onChange}
                     />
                   </div>
                 )}
               />
             </div>
           </div>
         </div>
 
         <FieldSeparator />
 
         <div>
           <div className="mb-4 flex items-center gap-2">
             <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
               5
             </span>
             <h3 className="text-xl font-semibold tracking-tight">
               {t("features_amenities")}
             </h3>
           </div>
 
           <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
             {features?.map((feature) => (
               <Controller
                 key={feature.id}
                 name="features"
                 control={control}
                 render={({ field }) => (
                   <div className="flex items-center space-x-2 rounded-md border p-3">
                     <Checkbox
                       id={`feature-${feature.id}`}
                       checked={field.value?.includes(feature.id)}
                       onCheckedChange={(checked) =>
                         checked
                           ? field.onChange([...(field.value || []), feature.id])
                           : field.onChange(
                               field.value?.filter((value) => value !== feature.id),
                             )
                       }
                     />
                     <Label
                       htmlFor={`feature-${feature.id}`}
                       className="cursor-pointer text-sm font-normal"
                     >
                       {feature.name}
                     </Label>
                   </div>
                 )}
               />
             ))}
           </div>
         </div>
 
         <FieldSeparator />
 
         <div>
           <div className="mb-4 flex items-center gap-2">
             <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
               6
             </span>
             <h3 className="text-xl font-semibold tracking-tight">
               {t("location_surroundings")}
             </h3>
           </div>
 
           <div className="space-y-6">
             <div>
               <FieldLabel className="mb-3 block">{t("nearby_points")}</FieldLabel>
               <div className="flex flex-wrap gap-2">
                 {nearPlaces?.map((place) => (
                   <Controller
                     key={place.id}
                     name="nearPlaces"
                     control={control}
                     render={({ field }) => (
                       <div
                         onClick={() => {
                           const checked = field.value?.includes(place.id);
                           return !checked
                             ? field.onChange([...(field.value || []), place.id])
                             : field.onChange(field.value?.filter((v) => v !== place.id));
                         }}
                         className={`cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors ${
                           field.value?.includes(place.id)
                             ? "border-blue-600 bg-blue-600 text-white"
                             : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
                         }`}
                       >
                         {place.name}
                       </div>
                     )}
                   />
                 ))}
               </div>
             </div>
 
             <div className="grid gap-4 md:grid-cols-2">
               <Field>
                 <Label>{t("wilaya")}</Label>
                 <Select
                   value={selectedWilaya?.toString()}
                   onValueChange={(val) => setSelectedWilaya(parseInt(val))}
                 >
                   <SelectTrigger>
                     <SelectValue placeholder={t("select_wilaya")} />
                   </SelectTrigger>
                   <SelectContent>
                     {wilayas?.wilayas?.map((w) => (
                       <SelectItem key={w.id} value={w.id.toString()}>
                         {w.id} - {w.name}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </Field>
 
               <Controller
                 name="location.cityId"
                 control={control}
                 render={({ field, fieldState }) => (
                   <Field data-invalid={fieldState.invalid}>
                     <FieldLabel>{t("city")}</FieldLabel>
                     <Select
                       value={field.value?.toString()}
                       onValueChange={(val) => field.onChange(Number(val))}
                       disabled={!selectedWilaya || loadingCities}
                     >
                       <SelectTrigger>
                         <SelectValue placeholder={t("select_city")} />
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
 
             <div className="space-y-2">
               <FieldLabel>{t("exact_location")}</FieldLabel>
               <p className="text-sm text-muted-foreground -mt-1">
                 {t("exact_location_hint") ||
                   "انقر على الخريطة لتحديد الموقع الدقيق للعقار"}
               </p>
 
               <Controller
                 name="location"
                 control={control}
                 render={({ field }) => (
                   <LocationPicker
                     value={
                       field.value?.latitude && field.value?.longitude
                         ? {
                             lat: field.value.latitude,
                             lng: field.value.longitude,
                           }
                         : undefined
                     }
                     onChange={({ lat, lng, address }) => {
                       field.onChange({
                         ...field.value,
                         latitude: lat,
                         longitude: lng,
                         address,
                       });
                     }}
                   />
                 )}
               />
             </div>
           </div>
         </div>
       </FieldGroup>
 
       <div className="mt-8 flex items-center justify-end gap-4 border-t pt-4">
         <Button variant="ghost" type="button" disabled={isSubmitting}>
           {t("save_draft")}
         </Button>
         <Button
           type="submit"
           disabled={isSubmitting}
           className="min-w-35 bg-blue-600 text-white hover:bg-blue-700"
         >
           {isSubmitting ? t("publishing") : t("publish_property")}
         </Button>
       </div>
     </form>
   );
 }
 
 type UpdatePropertyFormProps = {
   locale: PropertyFormLocale;
   listing: DTOResponse<ListingResourceDetails>;
 };
 
 export function UpdatePropertyForm({ locale, listing }: UpdatePropertyFormProps) {
   const { t } = useTranslation("property-form");
   const { token } = useAuth();
   const { mutateAsync: updateListing, status: updateStatus } =
     useUpdateMemberListing();
 
   const [defaultValues, setDefaultValues] = useState<PropertyFormValues | null>(
     null,
   );
   const initialSelectedWilaya = useMemo(() => {
     const wilayaCode = listing?.data?.location?.wilayaCode;
     const n = wilayaCode ? Number(wilayaCode) : NaN;
     return Number.isFinite(n) && n > 0 ? n : undefined;
   }, [listing]);
 
   const listingCityName = listing?.data?.location?.city;
 
   useEffect(() => {
     let cancelled = false;
     (async () => {
       const values = await ListingToForm(listing.data);
       if (cancelled) return;
       setDefaultValues(values as PropertyFormValues);
     })();
     return () => {
       cancelled = true;
     };
   }, [listing]);
 
   if (!defaultValues) {
     return (
       <div className="flex h-[40vh] w-full items-center justify-center">
         <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
       </div>
     );
   }
 
   return (
     <PropertyFormBase
       locale={locale}
       mode="update"
       defaultValues={defaultValues}
       initialSelectedWilaya={initialSelectedWilaya}
       listingCityName={listingCityName}
       isSuccess={updateStatus === "success"}
       onSubmit={async (data) => {
         if (!token) {
           toast.error(t("error_login"));
           return;
         }
         await updateListing({ listing: listing.data.id, updateRequest: data });
         toast.success(t("success_update"));
       }}
     />
   );
 }
 
 //   @ts-ignore
 export const createPropertyDefaultValues: PropertyFormValues = defaultProperty as PropertyFormValues;
