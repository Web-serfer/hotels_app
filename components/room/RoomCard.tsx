'use client';

import axios from 'axios';
import { useState } from 'react';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import { Separator } from '../ui/separator';
import { usePathname } from 'next/navigation';

import { Booking, Hotel, Room } from '@prisma/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import Image from 'next/image';
import AmenityItem from '../AmenityItem';
import {
  AirVent,
  Bath,
  Bed,
  BedDouble,
  Castle,
  Home,
  Loader2,
  MountainSnow,
  Ship,
  Trash,
  Trees,
  Tv,
  Users,
  UtensilsCrossed,
  VolumeX,
  Wifi,
  Plus,
  Pencil,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import AddRoomForm from '../room/AddRoomForm';
import { useToast } from '@/components/ui/use-toast';

interface RoomCardProps {
  hotel?: Hotel & {
    rooms: Room[];
  };
  room: Room;
  bookings?: Booking[];
}

const RoomCard = ({ hotel, room, bookings = [] }: RoomCardProps) => {
  // states
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const { toast } = useToast();
  const router = useRouter();

  const pathname = usePathname();
  const isHotelDetailsPage = pathname.includes('hotel-details');

  const handleDialogueOpen = () => {
    setOpen((prev) => !prev);
  };

  //  delete room
  const handleRoomDelete = async (room: Room) => {
    setIsLoading(true);
    const imageKey = room.image.substring(room.image.lastIndexOf('/' + 1));

    await axios
      .post('/api/uploadthing/delete', { imageKey })
      .then(() => {
        axios
          .delete(`/api/room/${room.id}`)
          .then(() => {
            router.refresh();
            toast({
              variant: 'success',
              description: 'Room Deleted!',
            });
            setIsLoading(false);
          })
          .catch((err) => {
            setIsLoading(false);
            toast({
              variant: 'destructive',
              description: 'Something went wrong!',
            });
          });
      })
      .catch(() => {
        setIsLoading(false);
        toast({
          variant: 'destructive',
          description: 'Something went wrong!',
        });
      });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{room.title}</CardTitle>
        <CardDescription>{room.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="aspect-square overflow-hidden relative h-[200px] rounded-lg">
          <Image
            src={room.image}
            alt={room.title}
            fill
            className="object-cover"
          />
        </div>
        {/* Amenity Items */}
        <div className="grid grid-cols-2 gap-4 content-start text-sm">
          {/* beds count */}
          <AmenityItem>
            <Bed className="w-4 h-4" />
            {room.bedCount} Bed{'(s)'}
          </AmenityItem>
          {/* guest count */}
          <AmenityItem>
            <Users className="w-4 h-4" />
            {room.guestCount} Guest{'(s)'}
          </AmenityItem>
          {/* bathroom count */}
          <AmenityItem>
            <Bath className="w-4 h-4" />
            {room.bathroomCount} Bathroom{'(s)'}
          </AmenityItem>

          {/* king beds */}
          {!!room.kingBed && (
            <AmenityItem>
              <BedDouble className="w-4 h-4" />
              {room.kingBed} King Bed{'(s)'}
            </AmenityItem>
          )}
          {/* queen bed */}
          {!!room.queenBed && (
            <AmenityItem>
              <Bed className="w-4 h-4" />
              {room.queenBed} Queen Bed{'(s)'}
            </AmenityItem>
          )}
          {/* room service */}
          {room.roomService && (
            <AmenityItem>
              <UtensilsCrossed className="w-4 h-4" />
              Room Services
            </AmenityItem>
          )}
          {/* TV */}
          {room.TV && (
            <AmenityItem>
              <Tv className="w-4 h-4" />
              TV
            </AmenityItem>
          )}
          {/* balcony */}
          {room.balcony && (
            <AmenityItem>
              <Home className="w-4 h-4" />
              Balcony
            </AmenityItem>
          )}
          {/* free wi-fi */}
          {room.freeWifi && (
            <AmenityItem>
              <Wifi className="w-4 h-4" />
              Free Wifi
            </AmenityItem>
          )}
          {/* city view*/}
          {room.cityView && (
            <AmenityItem>
              <Castle className="w-4 h-4" />
              City View
            </AmenityItem>
          )}
          {/* ocean view*/}
          {room.oceanView && (
            <AmenityItem>
              <Ship className="w-4 h-4" />
              Ocean View
            </AmenityItem>
          )}
          {/* forest view*/}
          {room.forestView && (
            <AmenityItem>
              <Trees className="w-4 h-4" />
              Forest View
            </AmenityItem>
          )}
          {/* mountain view*/}
          {room.mountainView && (
            <AmenityItem>
              <MountainSnow className="w-4 h-4" />
              Mountain View
            </AmenityItem>
          )}
          {/* air condition*/}
          {room.airCondition && (
            <AmenityItem>
              <AirVent className="w-4 h-4" />
              Air Condition
            </AmenityItem>
          )}
          {/* sound proofed*/}
          {room.airCondition && (
            <AmenityItem>
              <VolumeX className="w-4 h-4" />
              Sound Proofed
            </AmenityItem>
          )}
        </div>
        <Separator />
        <div className="flex gap-4 justify-between">
          <div>
            Room Price: <span className="font-bold">${room.roomPrice}</span>
            <span className="text-xs"> /24hrs</span>
          </div>
          {!!room.breakFastPrice && (
            <div>
              BreakFast Price:{' '}
              <span className="font-bold">${room.breakFastPrice}</span>
            </div>
          )}
        </div>
        <Separator />
      </CardContent>
      <CardFooter>
        {isHotelDetailsPage ? (
          <div>Hotel Details Page</div>
        ) : (
          <div className="flex w-full justify-between">
            <Button
              onClick={() => handleRoomDelete(room)}
              disabled={isLoading}
              type="button"
              variant="ghost"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2" /> Deleting...
                </>
              ) : (
                <>
                  <Trash className="w-4 h-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
            {/* dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger>
                <Button
                  type="button"
                  variant="outline"
                  className="max-w-[150px]"
                >
                  <Pencil className="mr-2 w-4 h-4" /> Update Room
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[900px] w-[90%]">
                <DialogHeader className="px-2">
                  <DialogTitle>Update Room</DialogTitle>
                  <DialogDescription>
                    Make changes to this room.
                  </DialogDescription>
                </DialogHeader>

                {/* AddRoomForm */}
                <AddRoomForm
                  hotel={hotel}
                  room={room}
                  handleDialogueOpen={handleDialogueOpen}
                />
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default RoomCard;
