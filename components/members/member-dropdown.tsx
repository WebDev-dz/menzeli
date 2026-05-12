"use client"

import { HelpCircle, LogOut, Settings, User as UserIcon, Heart, LayoutDashboard } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User } from "@/api"
import { useAuth } from "@/components/providers/auth"
import { useTranslation } from "react-i18next"
import Link from "next/link"
import { API_URL } from "@/lib/api-config"



const UserDropdown = () => {
  const { user, logout } = useAuth()
  const { t } = useTranslation("common")
  
  // Prefer prop user, fallback to auth user

  if (!user) return null

  // Helper to get display name
  const getDisplayName = () => {
    if ('name' in user && user.name) return user.name
    return user.phone
  }

  // Helper to get initials
  const getInitials = () => {
    const name = getDisplayName()
    if (!name) return "U"
    return name.substring(0, 2).toUpperCase()
  }

  // Helper to get email
  const getEmail = () => {
    if ('email' in user && user.email) return user.email
    return null
  }

  // Helper to get profile image
  const getProfileImage = () => {
    if ('profileImage' in user && user.profileImage) {
        
      if(user.profileImage.startsWith('http')) return user.profileImage;
      const imageUrl = `${API_URL}${user.profileImage}`
      return imageUrl
    }
    return undefined
  }

  return (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button className="relative h-10 w-10 rounded-full" variant="ghost">
        <Avatar>
          <AvatarImage alt={getDisplayName()} src={getProfileImage()} />
          <AvatarFallback>{getInitials()}</AvatarFallback>
        </Avatar>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-56">
      <DropdownMenuLabel className="font-normal">
        <div className="flex flex-col space-y-1">
          <p className="font-medium text-sm leading-none">{getDisplayName()}</p>
          {getEmail() && (
            <p className="text-muted-foreground text-xs leading-none">{getEmail()}</p>
          )}
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      
      <DropdownMenuItem asChild>
        <Link href="/dashboard" className="cursor-pointer w-full">
            <UserIcon className="mr-2 h-4 w-4" />
            {t('dropdown.profile')}
        </Link>
      </DropdownMenuItem>
      
      <DropdownMenuItem asChild>
        <Link href="/dashboard/my-listings" className="cursor-pointer w-full">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            {t('dropdown.my_listings')}
        </Link>
      </DropdownMenuItem>

      <DropdownMenuItem asChild>
        <Link href="/dashboard/favorites" className="cursor-pointer w-full">
            <Heart className="mr-2 h-4 w-4" />
            {t('dropdown.favorites')}
        </Link>
      </DropdownMenuItem>

      {/* <DropdownMenuItem asChild>
        <Link href="/dashboard/settings" className="cursor-pointer w-full">
            <Settings className="mr-2 h-4 w-4" />
            {t('dropdown.settings')}
        </Link>
      </DropdownMenuItem> */}

      <DropdownMenuItem>
        <HelpCircle className="mr-2 h-4 w-4" />
        {t('dropdown.help')}
      </DropdownMenuItem>
      
      <DropdownMenuSeparator />
      
      <DropdownMenuItem 
        variant="destructive" 
        onClick={() => logout()}
        className="cursor-pointer"
      >
        <LogOut className="mr-2 h-4 w-4" />
        {t('dropdown.logout')}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
)}

export default UserDropdown
