import { useState, useEffect, useCallback } from "react";
import type { HotelResult } from "@shared/hotels/types";

export interface SavedHotel {
  hotelId: string;
  name: string;
  address: string;
  imageUrl: string;
  stars: number;
  reviewScore: number;
  savedAt: number;
}

const WISHLIST_KEY = "gotravel_hotel_wishlist";

export function useWishlist() {
  const [savedHotels, setSavedHotels] = useState<SavedHotel[]>([]);

  // App စတက်တာနဲ့ localStorage ထဲက Save ထားတာတွေကို ပြန်ခေါ်ပါမယ်
  useEffect(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_KEY);
      if (stored) {
        setSavedHotels(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load wishlist from local storage", error);
    }
  }, []);

  const toggleSave = useCallback((hotel: HotelResult) => {
    setSavedHotels((prev) => {
      const isAlreadySaved = prev.some((h) => h.hotelId === hotel.hotelId);
      
      let nextList: SavedHotel[];
      if (isAlreadySaved) {
        // ရှိပြီးသားဆိုရင် ပြန်ဖြုတ်မယ် (Remove)
        nextList = prev.filter((h) => h.hotelId !== hotel.hotelId);
      } else {
        // မရှိသေးရင် အသစ်ထည့်မယ် (Add)
        const newSaved: SavedHotel = {
          hotelId: hotel.hotelId,
          name: hotel.name,
          address: hotel.address || "",
          imageUrl: hotel.images?.[0] || hotel.imageUrl,
          stars: hotel.stars || 0,
          reviewScore: hotel.reviewScore || 0,
          savedAt: Date.now(),
        };
        nextList = [newSaved, ...prev];
      }

      // localStorage ထဲကို ချက်ချင်း Save လုပ်မယ်
      try {
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(nextList));
      } catch (error) {
        console.error("Failed to save wishlist to local storage", error);
      }
      
      return nextList;
    });
  }, []);

  const isSaved = useCallback(
    (hotelId: string) => savedHotels.some((h) => h.hotelId === hotelId),
    [savedHotels]
  );

  return {
    savedHotels,
    toggleSave,
    isSaved,
  };
}
