import { Address, BigInt } from "@graphprotocol/graph-ts";

import {
  ItemBought as ItemBoughtEvent,
  ItemCancelled as ItemCancelledEvent,
  ItemListed as ItemListedEvent
} from "../generated/NftMarketplace/NftMarketplace"

import {
  ItemBought,
  ItemCancelled,
  ItemListed ,
  ActiveItem
}
from "../generated/schema"

export function handleItemBought(event: ItemBoughtEvent): void {
  let ID = getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
  let itemBought = ItemBought.load(ID)
  // active items's buyer will change
  // everything else remains same
  let activeItem = ActiveItem.load(ID)
  // creating a new item bought, 
  // if already listed, updating entries 
  if(!itemBought){
    itemBought = new ItemBought(ID)
  }
  itemBought.nftAddress = event.params.nftAddress
  itemBought.tokenId = event.params.tokenId
  itemBought.price = event.params.price
  itemBought.buyer = event.params.buyer
  // ! means it wont be undefined
  activeItem!.buyer = event.params.buyer
  activeItem!.save()
  itemBought.save()
}

export function handleItemCancelled(event: ItemCancelledEvent): void {
  let ID = getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
  let itemCancelled = ItemCancelled.load(ID)
  // active items's buyer will change
  // everything else remains same
  let activeItem = ActiveItem.load(ID)
  // creating a new item bought, 
  // if already listed, updating entries 
  if(!itemCancelled){
    itemCancelled = new ItemCancelled(ID)
  }
  itemCancelled.nftAddress = event.params.nftAddress
  itemCancelled.tokenId = event.params.tokenId
  itemCancelled.seller = event.params.seller
  // if address == dead address, item is bought
  activeItem!.buyer = Address.fromString("0x000000000000000000000000000000000000dEaD")
  activeItem!.save()
  itemCancelled.save()
  // ! means it wont be undefined
}

export function handleItemListed(event: ItemListedEvent): void {
  let ID = getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
  let activeItem = ActiveItem.load(ID)
  let itemListed = ItemListed.load(ID)
  if(!itemListed){
    itemListed = new ItemListed(ID)
  }
  // If new listing, then this is called
  // Else, update functionality works
  if(!activeItem){
    activeItem = new ActiveItem(ID)
  }
  itemListed.seller = event.params.seller
  activeItem.seller = event.params.seller
  itemListed.nftAddress = event.params.nftAddress
  activeItem.nftAddress = event.params.nftAddress
  itemListed.tokenId = event.params.tokenId
  activeItem.tokenId = event.params.tokenId

  itemListed.price = event.params.price
  activeItem.price = event.params.price
  // Empty Addres == Address on market
  activeItem.buyer = Address.fromString("0x0000000000000000000000000000000000000000")

  activeItem.save()
  itemListed.save()
}

// we need a unique id for a table
function getIdFromEventParams(tokenId: BigInt, nftAddress: Address): string {
  return tokenId.toHexString() + nftAddress.toHexString()
}