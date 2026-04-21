"use client";
import * as z from "zod";
import { defaultProperty, formSchema, ListingToForm, PropertyFormValues } from "@/lib/property-schema";
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
import {
  UploadThingImageGrid,
  ImageItem,
} from "@/components/uploadthing-image-grid";
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
import {
  useCreateMemberListing,
  useUpdateMemberListing,
} from "@/hooks/use-member-listings";
import { useAuth } from "@/components/providers/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ListingResource } from "@/api";
import { fileToUrl, urlToFile } from "@/lib/utils";
import { useTranslation } from "react-i18next";

type Props = {
  type?: "edit";
  listing?: ListingResource;
};

export function PropertyForm({ type, listing }: Props) {
  const { t, i18n } = useTranslation("property-form");
  const { data: propertyTypes } = usePropertyTypes();
  const { data: rentDurations } = useRentDurations();
  const { data: features } = useFeatures();
  const { data: nearPlaces } = useNearPlaces();
  const { data: wilayas } = useWilayas();

  const [selectedWilaya, setSelectedWilaya] = useState<number | undefined>();
  const { data: cities, isLoading: loadingCities } = useCities(selectedWilaya);


  const { mutateAsync: createListing, status: createStatus } =
    useCreateMemberListing();
  const { mutateAsync: updateListing, status: updateStatus } =
    useUpdateMemberListing();
  const { token, isLoading: loadingUser } = useAuth();
  const router = useRouter();

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultProperty,
  });
  const {
    formState: { isSubmitting, isSubmitSuccessful },
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
  } = form;

  // Initialize form with listing data for edit mode
  useEffect(() => {
    if (type === "edit" && listing) {
      console.log("listing", listing);
      // Set selected wilaya to trigger city loading
      const loadForm = async () => {
       const listingForm = await ListingToForm(listing);
        reset(listingForm);
        const wilayaCode = listing?.location?.wilayaCode || 0;
        setSelectedWilaya(Number(wilayaCode));
        
      };

      loadForm();
    }
  }, []);



  useEffect(()=>{
        const cityName = listing?.location?.city || "";
        const city = cities?.cities?.find((city) => city.name == cityName)
        console.log({ city })
        const cityId = cities?.cities.find((city) => city.name === cityName)?.id || 0;
        setValue("location.cityId", cityId);
        console.log("cityId", cityId);
        console.log(listing)
  },[selectedWilaya])



  const onSubmit = async (data: PropertyFormValues) => {
    try {
      if (!token) {
        toast.error(t("error_login"));
        return;
      }

      if (type === "edit" && listing) {
        await updateListing({
          listing: listing.id,
          updateRequest: data,
        });
        toast.success(t("success_update"));
      } else {
        await createListing(data);
        toast.success(t("success_create"));
      }

      router.push("/dashboard/my-listings");
      form.reset();
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(
        type === "edit"
          ? t("error_update")
          : t("error_create"),
      );
    }
  };

  const onError = (error: typeof form.formState.errors) => {
    console.log("error", error);
    console.log("form", form.getValues());
    toast.error(t("error_create"));
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
            {t("success_title")}
          </h2>
          <p className="text-center text-lg text-pretty text-muted-foreground">
            {t("success_message")}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onError)}
      className="p-2 sm:p-5 md:p-8 w-full rounded-md gap-2 border mx-auto bg-white"
    >
      <FieldGroup className="space-y-8">
        {/* Section 1: Media Gallery */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
              1
            </span>
            <h3 className="font-semibold text-xl tracking-tight">
              {t("media_gallery")}
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Controller
              name="mainImage"
              control={control}
              render={({ field, fieldState }) => (
                <div className="col-span-1">
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>{t("main_cover_image")}</FieldLabel>
                    <UploadThingDropzone
                      onSelect={(files) => {
                        field.onChange(files[0]);
                      }}
                      accept="image/png, image/jpeg, image/gif"
                      maxFiles={1}
                      maxSize={5242880}
                    />
                    {field.value && (
                      <div className="mt-2 relative aspect-video rounded-lg overflow-hidden border">
                        <img
                          src={
                            typeof field.value === "string"
                              ? field.value
                              : fileToUrl(field.value as File)
                          }
                          alt="Main cover"
                          className="object-cover w-full h-full"
                        />
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
                    <FieldLabel>{t("property_gallery")}</FieldLabel>
                    <UploadThingImageGrid
                      value={field?.value?.map(
                        (file: any, index: number) => ({
                          id: index.toString(),
                          file: file as File,
                          url: fileToUrl(file as any)
                           
                        }),
                      )}
                      onChange={(images) =>
                        field.onChange(images.map((img) => img.file))
                      }
                      onUpload={async (files) => {
                        const urls = files.map(fileToUrl);
                        form.setValue("images", files);
                        // We shouldn't set form value here directly if onChange handles it
                        // But we want to keep the File objects if possible for submission?
                        // If we convert to strings in onChange, we lose the File objects.
                        // For now, let's stick to the fix for rendering.
                        return urls.map((url, index) => ({
                          id: index.toString(),
                          url,
                          file: files[index]
                        }));
                      }}
                      maxImages={10}
                    />
                    <FieldDescription>
                      {t("property_gallery_desc")}
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
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
              2
            </span>
            <h3 className="font-semibold text-xl tracking-tight">
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

            <div className="grid md:grid-cols-2 gap-4">
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
                    <FieldLabel htmlFor="rent_duration_id">
                      {t("rent_type")}
                    </FieldLabel>
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(val) => field.onChange(parseInt(val))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("select_duration")} />
                      </SelectTrigger>
                      <SelectContent>
                        {rentDurations?.map((duration) => (
                          <SelectItem
                            key={duration.id}
                            value={duration.id.toString()}
                          >
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
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
              3
            </span>
            <h3 className="font-semibold text-xl tracking-tight">
              {t("specifications")}
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Controller
              name="floor"
              control={control}
              render={({ field: { value, onChange, ...rest }, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="floor">{t("floor_no")}</FieldLabel>
                  <Input
                    value={value ? value.toString() : undefined}
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
                    value={value ? value.toString() : undefined}
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
                    value={value ? value.toString() : undefined}
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

        {/* Section 4: Pricing & Availability */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
              4
            </span>
            <h3 className="font-semibold text-xl tracking-tight">
              {t("pricing_availability")}
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-start">
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
                    <FieldLabel htmlFor="min_duration">
                      {t("min_duration")}
                    </FieldLabel>
                    <Input
                      value={value ? value.toString() : undefined}
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
                      checked={field.value}
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
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
              5
            </span>
            <h3 className="font-semibold text-xl tracking-tight">
              {t("features_amenities")}
            </h3>
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
                            ? field.onChange([
                                ...(field.value || []),
                                feature.id,
                              ])
                            : field.onChange(
                                field.value?.filter(
                                  (value) => value !== feature.id,
                                ),
                              );
                        }}
                      />
                      <Label
                        htmlFor={`feature-${feature.id}`}
                        className="cursor-pointer text-sm font-normal"
                      >
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
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
              6
            </span>
            <h3 className="font-semibold text-xl tracking-tight">
              {t("location_surroundings")}
            </h3>
          </div>

          <div className="space-y-6">
            <div>
              <FieldLabel className="mb-3 block">
                {t("nearby_points")}
              </FieldLabel>
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
                            : field.onChange(
                                field.value?.filter(
                                  (value) => value !== place.id,
                                ),
                              );
                        }}
                        className={`
                          cursor-pointer px-4 py-2 rounded-full text-sm border transition-colors
                          ${
                            field.value?.includes(place.id)
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
              </div>

              <Controller
                name="location.cityId"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>{t("city")}</FieldLabel>
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(val) => {
                        console.log({ val });
                        field.onChange(Number(val))
                        console.log({ form : form.getValues()})
                      }}
                        
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

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Field>
                  <FieldLabel>{t("street_address")}</FieldLabel>
                  <Input placeholder={t("start_typing_address")} />
                </Field>
                {/* Map placeholder */}
                <div className="aspect-video bg-zinc-100 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-400">
                  {t("map_view")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </FieldGroup>

      <div className="mt-8 flex justify-end items-center gap-4 pt-4 border-t">
        <Button variant="ghost" type="button" disabled={isSubmitting}>
          {t("save_draft")}
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white min-w-35"
        >
          {isSubmitting ? t("publishing") : t("publish_property")}
        </Button>
      </div>
    </form>
  );
}
