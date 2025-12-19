import prisma from "../prisma"
import { PlaylistType } from "@prisma/client"

/**
 * Adds an item to a playlist
 * Checks for duplicates before adding
 * Called by Inngest function after user interaction
 */
export const addToPlaylist = async (
  playlistId: string,
  itemId: string,
  itemName: string,
) => {
  // Check if item already exists in this playlist
  const existingItem = await prisma.playlistItem.findFirst({
    where: {
      playlistId: playlistId,
      itemId: itemId,
    },
  })

  if (existingItem) {
    return {
      success: true,
      message: "Item already in playlist",
      item: existingItem,
    }
  }

  const playlistItem = await prisma.playlistItem.create({
    data: {
      itemId: itemId,
      playlistId: playlistId,
      itemName: itemName,
    },
  })

  return {
    success: true,
    message: "Added to playlist successfully",
    item: playlistItem,
  }
}

/**
 * Removes an item from a playlist
 * Called by Inngest function after user interaction
 */
export const removeFromPlaylist = async (
  playlistId: string,
  itemId: string,
) => {
  // Find the playlist item to remove
  const playlistItem = await prisma.playlistItem.findFirst({
    where: {
      playlistId: playlistId,
      itemId: itemId,
    },
  })

  if (!playlistItem) {
    return {
      success: false,
      message: "Item not found in playlist",
      error: "NOT_FOUND",
    }
  }

  // Remove the item from the playlist
  await prisma.playlistItem.delete({
    where: {
      id: playlistItem.id,
    },
  })

  return { success: true, message: "Item removed from playlist" }
}
