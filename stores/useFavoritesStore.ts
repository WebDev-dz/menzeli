import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ListingResource } from '@/api';

interface FavoritesState {
  favorites: ListingResource[];
  addFavorite: (listing: ListingResource) => void;
  removeFavorite: (listingId: number) => void;
  isFavorite: (listingId: number) => boolean;
  toggleFavorite: (listing: ListingResource) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (listing) =>
        set((state) => ({
          favorites: [...state.favorites, listing],
        })),
      removeFavorite: (listingId) =>
        set((state) => ({
          favorites: state.favorites.filter((item) => item.id !== listingId),
        })),
      isFavorite: (listingId) =>
        get().favorites.some((item) => item.id === listingId),
      toggleFavorite: (listing) => {
        const { isFavorite, addFavorite, removeFavorite } = get();
        if (isFavorite(listing.id)) {
          removeFavorite(listing.id);
        } else {
          addFavorite(listing);
        }
      },
    }),
    {
      name: 'menzeli-favorites',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
