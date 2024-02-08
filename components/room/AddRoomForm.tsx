'use client';

import * as z from 'zod';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Hotel, Room } from '@prisma/client';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import Image from 'next/image';
import { Button } from '../ui/button';
import { Loader2, Pencil, PencilLine, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { UploadButton } from '../uploadthing';

interface AddRoomFormProrps {
  hotel?: Hotel & {
    room: Room[];
  };
  room?: Room;
  handleDialogueOpen: () => void;
}

const formShema = z.object({
  title: z.string().min(3, {
    message: 'Title must be atleast 3 characters long',
  }),
  description: z.string().min(10, {
    message: 'Description must be atleast 10 characters long',
  }),
  bedCount: z.coerce.number().min(1, { message: 'Bed count is required' }),
  guestCount: z.coerce.number().min(1, { message: 'Guest count is required' }),
  bathroomCount: z.coerce
    .number()
    .min(1, { message: 'Bathroom count is required' }),
  kingBed: z.coerce.number().min(0),
  queenBed: z.coerce.number().min(0),
  image: z.string().min(1, {
    message: 'Image is required',
  }),
  breakFastPrice: z.coerce.number().optional(),
  roomPrice: z.coerce.number().min(1, { message: 'Room price is required' }),
  roomService: z.boolean().optional(),
  TV: z.boolean().optional(),
  balcony: z.boolean().optional(),
  freeWifi: z.boolean().optional(),
  cityView: z.boolean().optional(),
  oceanView: z.boolean().optional(),
  forestView: z.boolean().optional(),
  mountinView: z.boolean().optional(),
  airCondition: z.boolean().optional(),
  soundProofed: z.boolean().optional(),
});

const AddRoomForm = ({
  hotel,
  room,
  handleDialogueOpen,
}: AddRoomFormProrps) => {
  // States
  const [image, setImage] = useState<string | undefined>(room?.image);
  const [imageIsDeleting, setImageIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Toast
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formShema>>({
    resolver: zodResolver(formShema),
    defaultValues: room || {
      title: '',
      description: '',
      bedCount: 0,
      guestCount: 0,
      bathroomCount: 0,
      kingBed: 0,
      queenBed: 0,
      image: '',
      breakFastPrice: 0,
      roomPrice: 0,
      roomService: false,
      TV: false,
      balcony: false,
      freeWifi: false,
      cityView: false,
      oceanView: false,
      forestView: false,
      mountinView: false,
      airCondition: false,
      soundProofed: false,
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

  // function submit
  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    if (hotel && room) {
      // update hotel
      axios
        .patch(`/api/room/${room.id}`, values)
        .then((res) => {
          toast({
            variant: 'success',
            description: '💫 Room Update',
          });
          router.refresh();
          setIsLoading(false);
          handleDialogueOpen();
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
      // create room
      if (!hotel) return;
      axios
        .post('/api/room', { ...values, hotelId: hotel.id })
        .then((res) => {
          toast({
            variant: 'success',
            description: '👍 Room Creating',
          });
          router.refresh();
          setIsLoading(false);
          handleDialogueOpen();
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

  const checkboxes = [
    { name: 'roomService', label: '24hrs Room Services' },
    { name: 'TV', label: 'TV' },
    { name: 'balcony', label: 'Balcony' },
    { name: 'freeWifi', label: 'FreeWifi' },
    { name: 'cityView', label: 'CityView' },
    { name: 'oceanView', label: 'OceanView' },
    { name: 'forestView', label: 'ForestView' },
    { name: 'mountainsView', label: 'MountainsView' },
    { name: 'airCondition', label: 'AirCondition' },
    { name: 'soundProofed', label: 'SoundProofed' },
  ];

  return (
    <div className="max-h-[75vh] overflow-y-auto px-2">
      <Form {...form}>
        <form className="space-y-6">
          {/* room title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Room Title *</FormLabel>
                <FormDescription>Provide a room name</FormDescription>
                <FormControl>
                  <Input placeholder="Double Room" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* room description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Room Description *</FormLabel>
                <FormDescription>
                  Is there anything special about room
                </FormDescription>
                <FormControl>
                  <Textarea
                    placeholder="Have a beautiful view of the ocean while in this room!"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* ==== details room ==== */}
          <div>
            <FormLabel>Choose Room Amenities</FormLabel>
            <FormDescription>
              What makes this room a good chooce ?
            </FormDescription>
            {/* room amenities */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              {checkboxes.map((checkbox) => (
                <FormField
                  key={checkbox.name}
                  control={form.control}
                  name={checkbox.name}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-end space-x-3 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>{checkbox.label}</FormLabel>
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </div>

          {/* upload image */}
          <div>
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-3">
                  <FormLabel>Upload an Image *</FormLabel>
                  <FormDescription>
                    Choose an image that will show-case your room nicely
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
          {/* ====== MAIN SECTION  ====== */}
          <div className="grid grid-cols-2 gap-6 mt-2">
            {/* ==== left column ==== */}
            {/* room price */}
            <FormField
              control={form.control}
              name="roomPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Room *{' '}
                    <span className="text-xs text-gray-500">
                      (Price in USD)
                    </span>
                  </FormLabel>
                  <FormDescription>
                    State the price for staying in this room for 24hrs
                  </FormDescription>
                  <FormControl>
                    <Input type="number" min={0} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* bed Count */}
            <FormField
              control={form.control}
              name="bedCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bed Count *</FormLabel>
                  <FormDescription>
                    How many beds are avialable in this room ?
                  </FormDescription>
                  <FormControl>
                    <Input type="number" min={0} max={8} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* guest Count */}
            <FormField
              control={form.control}
              name="guestCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Guest Count *</FormLabel>
                  <FormDescription>
                    How many guests are allowed in this room ?
                  </FormDescription>
                  <FormControl>
                    <Input type="number" min={0} max={20} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* bathroom Count */}
            <FormField
              control={form.control}
              name="bathroomCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bathroom Count *</FormLabel>
                  <FormDescription>
                    How many bathroom are in this room ?
                  </FormDescription>
                  <FormControl>
                    <Input type="number" min={0} max={8} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* ==== right column  ==== */}
            {/* breakfast price */}
            <FormField
              control={form.control}
              name="breakFastPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Breakfast{' '}
                    <span className="text-xs text-gray-500">
                      (Price in USD)
                    </span>
                  </FormLabel>
                  <FormDescription>
                    State the cost of breakfast at the Hotel
                  </FormDescription>
                  <FormControl>
                    <Input type="number" min={0} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* king beds */}
            <FormField
              control={form.control}
              name="kingBed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>King Beds</FormLabel>
                  <FormDescription>
                    How many king beds are avialable in this room ?
                  </FormDescription>
                  <FormControl>
                    <Input type="number" min={0} max={8} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* queen bed */}
            <FormField
              control={form.control}
              name="queenBed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Queen Beds</FormLabel>
                  <FormDescription>
                    How many queen beds are in this room ?
                  </FormDescription>
                  <FormControl>
                    <Input type="number" min={0} max={8} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* ==== SUBMIT BUTTON ==== */}
          <div className="pt-4 pb-2">
            {/* button update */}
            {room ? (
              <Button
                onClick={() => {
                  form.handleSubmit(onSubmit);
                }}
                type="button"
                disabled={isLoading}
                className="max-w-[150px]"
              >
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
              <Button
                onClick={() => {
                  form.handleSubmit(onSubmit);
                }}
                type="button"
                disabled={isLoading}
                className="max-w-[150px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4" /> Creating
                  </>
                ) : (
                  <>
                    <Pencil className="mr-2 h-4 w-4" /> Create Room
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddRoomForm;
