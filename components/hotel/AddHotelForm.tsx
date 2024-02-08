'use client';

import * as z from 'zod';
import axios from 'axios';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Hotel, Room } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Input } from '../ui/input';
import { UploadButton } from '../uploadthing';
import { useToast } from '@/components/ui/use-toast';
import {
  Eye,
  Loader2,
  Pencil,
  PencilLine,
  Trash,
  X,
  XCircle,
  Terminal,
  Plus,
} from 'lucide-react';
import { Button } from '../ui/button';
import useLocation from '@/hooks/useLocation';
import { ICity, IState } from 'country-state-city';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import AddRoomForm from '../room/AddRoomForm';

interface AddHotelFormProps {
  hotel: HotelWithRooms | null;
}

export type HotelWithRooms = Hotel & {
  rooms: Room[];
};

const formSchema = z.object({
  title: z.string().min(3, {
    message: 'Title must be atleast 3 characters long',
  }),
  description: z.string().min(10, {
    message: 'Description must be atleast 10 characters long',
  }),
  image: z.string().min(1, {
    message: 'Image is required',
  }),
  country: z.string().min(1, {
    message: 'Country is required',
  }),
  state: z.string().optional(),
  city: z.string().optional(),
  locationDescription: z.string().min(10, {
    message: 'Description must be atleast 10 characters long',
  }),
  gym: z.boolean().optional(),
  spa: z.boolean().optional(),
  bar: z.boolean().optional(),
  laundry: z.boolean().optional(),
  restaurant: z.boolean().optional(),
  shopping: z.boolean().optional(),
  freeParking: z.boolean().optional(),
  bikeRental: z.boolean().optional(),
  freeWifi: z.boolean().optional(),
  movieNights: z.boolean().optional(),
  swimmingPool: z.boolean().optional(),
  coffeeShop: z.boolean().optional(),
});

const AddHotelForm = ({ hotel }: AddHotelFormProps) => {
  const [image, setImage] = useState<string | undefined>(hotel?.image);

  const [imageIsDeleting, setImageIsDeleting] = useState(false);
  const [states, setStates] = useState<IState[]>([]);
  const [cities, setCities] = useState<ICity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isHotelDeleting, setIsHotelDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  const { toast } = useToast();
  const router = useRouter();

  const { getAllCountries, getCountryStates, getStateCities } = useLocation();

  const countries = getAllCountries();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: hotel || {
      title: '',
      description: '',
      image: '',
      country: '',
      state: '',
      city: '',
      locationDescription: '',
      gym: false,
      spa: false,
      bar: false,
      laundry: false,
      restaurant: false,
      shopping: false,
      freeParking: false,
      bikeRental: false,
      freeWifi: false,
      movieNights: false,
      swimmingPool: false,
      coffeeShop: false,
    },
  });

  // Update image 
  useEffect(() => {
    if (typeof image === 'string') {
      form.setValue('image', image, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  }, [image]);

  // обновление country
  useEffect(() => {
    const selectedCountry = form.watch('country');
    const countryStates = getCountryStates(selectedCountry);
    if (countryStates) {
      setStates(countryStates);
    }
  }, [form.watch('country')]);

  // обновление country и state
  useEffect(() => {
    const selectedCountry = form.watch('country');
    const selectedState = form.watch('state');
    const stateCities = getStateCities(selectedCountry, selectedState);
    if (stateCities) {
      setCities(stateCities);
    }
  }, [form.watch('country'), form.watch('state')]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    if (hotel) {
      // update hotel
      axios
        .patch(`/api/hotel/${hotel.id}`, values)
        .then((res) => {
          toast({
            variant: 'success',
            description: '💫 Hotel Update',
          });
          router.push(`/hotel/${res.data.id}`);
          setIsLoading(false);
        })
        .catch((err) => {
          console.log(err);
          toast({
            variant: 'destructive',
            description: 'Something went wrong!',
          });
          setIsLoading(false);
        });
    } else {
      // create hotel
      axios
        .post('/api/hotel', values)
        .then((res) => {
          toast({
            variant: 'success',
            description: '👍 Hotel Creating',
          });
          router.push(`/hotel/${res.data.id}`);
          setIsLoading(false);
        })
        .catch((err) => {
          console.log(err);
          toast({
            variant: 'destructive',
            description: 'Something went wrong!',
          });
          setIsLoading(false);
        });
    }
  }

  // Функция удаления отеля
  const handleDeleteHotel = async (hotel: HotelWithRooms) => {
    setIsHotelDeleting(true);
    const getImageKey = (src: string) =>
      src.substring(src.lastIndexOf('/') + 1);

    try {
      const imageKey = getImageKey(hotel.image);
      await axios.post('/api/uploadthing/delete', { imageKey });
      await axios.delete(`/api/hotel/${hotel.id}`);

      setIsHotelDeleting(false);
      toast({
        variant: 'success',
        description: '💢 Hotel Delete!',
      });

      router.push('hotel/new');
    } catch (error) {
      console.log(error);
      setIsHotelDeleting(false);
      toast({
        variant: 'destructive',
        description: `Hotel deletion could not be completed!${error.message}`,
      });
    }
  };

  // Delete image
  const handleImageDelete = (image: string) => {
    setImageIsDeleting(true);
    const imageKey = image.substring(image.lastIndexOf('/') + 1);

    axios
      .post('/api/uploadthing/delete', { imageKey })
      .then((res) => {
        if (res.data.success) {
          setImage('');
          toast({
            variant: 'success',
            description: 'Image removed',
          });
        }
      })
      .catch(() => {
        toast({
          variant: 'destructive',
          description: 'Something went wrong',
        });
      })
      .finally(() => {
        setImageIsDeleting(false);
      });
  };

  const handleDialogueOpen = () => {
    setOpen((prev) => !prev);
  };

  const amenities = [
    { name: 'gym', label: 'Gym' },
    { name: 'spa', label: 'Spa' },
    { name: 'bar', label: 'Bar' },
    { name: 'laundry', label: 'Laundry' },
    { name: 'restaurant', label: 'Restaurant' },
    { name: 'shopping', label: 'Shopping' },
    { name: 'freeParking', label: 'Free Parking' },
    { name: 'bikeRental', label: 'Bike Rental' },
    { name: 'freeWifi', label: 'Free WiFi' },
    { name: 'movieNights', label: 'Movie Nights' },
    { name: 'swimmingPool', label: 'Swimming Pool' },
    { name: 'coffeeShop', label: 'Coffee Shop' },
  ];

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <h3 className="text-lg font-semibold">
            {hotel ? 'Update your hotel!' : 'Describe your hotel!'}
          </h3>
          <div className="flex flex-col md:flex-row gap-6">
            {/* ==== left side ==== */}
            <div className="flex-1 flex flex-col gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hotel Title *</FormLabel>
                    <FormDescription>Provide your hotel name</FormDescription>
                    <FormControl>
                      <Input placeholder="Beach Hotel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hotel Description *</FormLabel>
                    <FormDescription>
                      Provide a detailed description of your hotel
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder="Beach Hotel is parked with many awesome amenitie"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* choose amenities */}
              <div>
                <FormLabel>Choose Amenities</FormLabel>
                <FormDescription>
                  Choose Amenities popular in your hotel
                </FormDescription>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {amenities.map((amenity) => (
                    <FormField
                      key={amenity.name}
                      control={form.control}
                      name={amenity.name}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-end space-x-3 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>{amenity.label}</FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* upload image */}
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-3">
                    <FormLabel>Upload an Image *</FormLabel>
                    <FormDescription>
                      Choose an image that will show-case your hotel nicely
                    </FormDescription>
                    <FormControl>
                      {image ? (
                        <>
                          <div className="relative max-w-[400px]min-w-[200px] max-h-[400px] min-h-[200px] mt-4">
                            <Image
                              fill
                              src={image}
                              alt="Hotel Image"
                              className="object-contain"
                            />
                            <Button
                              onClick={() => handleImageDelete(image)}
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="absolute right-[-12px] top-0"
                            >
                              {imageIsDeleting ? <Loader2 /> : <XCircle />}
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* upload bitton */}
                          <div className="flex flex-col items-center max-w[4000px] p-12 border-2 border-dashed border-primary/50 rounded mt-4">
                            <UploadButton
                              endpoint="imageUploader"
                              onClientUploadComplete={(res) => {
                                console.log('Files: ', res);
                                setImage(res[0].url);
                                toast({
                                  variant: 'success',
                                  description: '👌 Upload Completed',
                                });
                              }}
                              onUploadError={(error: Error) => {
                                toast({
                                  variant: 'destructive',
                                  description: `ERROR! ${error.message}`,
                                });
                              }}
                            />
                          </div>
                        </>
                      )}
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* ==== right side ==== */}
            <div className="flex-1 flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Country selection */}
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select *</FormLabel>
                      <FormDescription>
                        In which country is your property located?
                      </FormDescription>
                      <Select
                        disabled={isLoading}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="bg-background">
                          <SelectValue
                            defaultValue={field.value}
                            placeholder="Select a Country"
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => {
                            return (
                              <SelectItem
                                key={country.isoCode}
                                value={country.isoCode}
                              >
                                {country.name}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                {/* State selection */}
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select State</FormLabel>
                      <FormDescription>
                        In which state is your property located?
                      </FormDescription>
                      <Select
                        disabled={isLoading || states.length < 1}
                        onValueChange={field.onChange}
                        value={field.value}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="bg-background">
                          <SelectValue
                            defaultValue={field.value}
                            placeholder="Select a State"
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {states.map((state) => {
                            return (
                              <SelectItem
                                key={state.isoCode}
                                value={state.isoCode}
                              >
                                {state.name}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              {/* City selection */}
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select City</FormLabel>
                    <FormDescription>
                      In which town/city is your property located?
                    </FormDescription>
                    <Select
                      disabled={isLoading || cities.length < 1}
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue
                          defaultValue={field.value}
                          placeholder="Select a City"
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => {
                          return (
                            <SelectItem key={city.name} value={city.name}>
                              {city.name}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {/* Location Description */}
              <FormField
                control={form.control}
                name="locationDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location Description *</FormLabel>
                    <FormDescription>
                      Provide a detailed location description of your hotel
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder="Located at the very end of the beach road!"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* alert window */}
              {hotel && !hotel.rooms.length && (
                <Alert className="bg-indigo-600 text-white">
                  <Terminal className="h-4 w-4 stroke-white" />
                  <AlertTitle>One last step!</AlertTitle>
                  <AlertDescription>
                    Your hotel was created successfuly 💯
                    <div>
                      Please add some room to complete your hotel setup!
                    </div>
                  </AlertDescription>
                </Alert>
              )}
              <div className="flex justify-between gap-2 flex-wrap">
                {/* button delete */}
                {hotel && (
                  <Button
                    onClick={() => handleDeleteHotel(hotel)}
                    variant="ghost"
                    type="button"
                    className="maw-w-[150px]"
                    disabled={isHotelDeleting || isLoading}
                  >
                    {isHotelDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4" />
                        Deleting{' '}
                      </>
                    ) : (
                      <>
                        <Trash className="mr-2 h-4 w-4" /> Delete
                      </>
                    )}
                  </Button>
                )}

                {/* button view hotel */}
                {hotel && (
                  <Button
                    onClick={() => router.push(`/hotel-details/${hotel.id}`)}
                    type="button"
                    variant="outline"
                  >
                    <Eye className="mr-2 h-4 w-4/6" /> View
                  </Button>
                )}

                {/* dialog window */}
                {hotel && (
                  <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger>
                      <Button
                        type="button"
                        variant="outline"
                        className="max-w-[150px]"
                      >
                        <Plus className="mr-2 w-4 h-4" /> Add Room
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[900px] w-[90%]">
                      <DialogHeader className="px-2">
                        <DialogTitle>Add a Room</DialogTitle>
                        <DialogDescription>
                          Add details about a room in your hotel.
                        </DialogDescription>
                      </DialogHeader>

                      {/* AddRoomForm */}
                      <AddRoomForm
                        hotel={hotel}
                        handleDialogueOpen={handleDialogueOpen}
                      />
                    </DialogContent>
                  </Dialog>
                )}

                {/* button submit */}
                {hotel ? (
                  <Button disabled={isLoading} className="max-w-[150px]">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4" /> Updating
                      </>
                    ) : (
                      <>
                        <PencilLine className="mr-2 h-4 w-4" /> Update
                      </>
                    )}
                  </Button>
                ) : (
                  <Button disabled={isLoading} className="max-w-[150px]">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4" /> Creating
                      </>
                    ) : (
                      <>
                        <Pencil className="mr-2 h-4 w-4" /> Create Hotel
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddHotelForm;
