"use client";

import { makeAutoObservable } from "mobx";

type Slug = string;

export class ViewStore {
  counts = new Map<Slug, number>();

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  // read: prefer store, fall back to initial value from server
  getCount(slug: Slug, initial: number) {
    return this.counts.get(slug) ?? initial;
  }

  // write: set confirmed value coming back from the backend
  setConfirmed(slug: Slug, value: number) {
    const cur = this.counts.get(slug);
    if (cur === undefined || value !== cur) {
      this.counts.set(slug, value);
    }
  }

  // prime: only raise or fill gaps based on server rendered cards
  primeFromCards(items: { slug: Slug; views: number }[]) {
    let changed = false;
    for (const { slug, views } of items) {
      const cur = this.counts.get(slug);
      if (cur === undefined || views > cur) {
        this.counts.set(slug, views);
        changed = true;
      }
    }
    return changed;
  }
}
