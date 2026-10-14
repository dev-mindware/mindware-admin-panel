"use client";

import { useQueryState, parseAsString, parseAsInteger } from "nuqs";

export function useAffiliateFilters() {
  const [search, setSearch] = useQueryState("search", parseAsString.withDefault("").withOptions({ shallow: true }));
  const [status, setStatus] = useQueryState("status", parseAsString.withDefault("ALL").withOptions({ shallow: true }));
  const [level, setLevel] = useQueryState("level", parseAsString.withDefault("ALL").withOptions({ shallow: true }));
  const [certification, setCertification] = useQueryState("certification", parseAsString.withDefault("ALL").withOptions({ shallow: true }));
  const [partnerType, setPartnerType] = useQueryState("partnerType", parseAsString.withDefault("ALL").withOptions({ shallow: true }));
  const [createdFrom, setCreatedFrom] = useQueryState("createdFrom", parseAsString.withDefault("").withOptions({ shallow: true }));
  const [createdTo, setCreatedTo] = useQueryState("createdTo", parseAsString.withDefault("").withOptions({ shallow: true }));
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1).withOptions({ shallow: true }));

  const activeFiltersCount = [
    Boolean(search),
    status && status !== "ALL",
    level && level !== "ALL",
    certification && certification !== "ALL",
    partnerType && partnerType !== "ALL",
    Boolean(createdFrom),
    Boolean(createdTo),
  ].filter(Boolean).length;

  const hasActiveFilters = activeFiltersCount > 0;

  const clearFilters = () => {
    setSearch("");
    setStatus("ALL");
    setLevel("ALL");
    setCertification("ALL");
    setPartnerType("ALL");
    setCreatedFrom("");
    setCreatedTo("");
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val || "");
    setPage(1);
  };

  return {
    filters: {
      search,
      status: status === "ALL" ? "" : status,
      level: level === "ALL" ? "" : level,
      certification: certification === "ALL" ? "" : certification,
      partnerType: partnerType === "ALL" ? "" : partnerType,
      createdFrom,
      createdTo,
    },
    raw: {
      search,
      status,
      level,
      certification,
      partnerType,
      createdFrom,
      createdTo,
      page,
    },
    setSearch: handleSearchChange,
    setStatus: (val: string) => { setStatus(val); setPage(1); },
    setLevel: (val: string) => { setLevel(val); setPage(1); },
    setCertification: (val: string) => { setCertification(val); setPage(1); },
    setPartnerType: (val: string) => { setPartnerType(val); setPage(1); },
    setCreatedFrom: (val: string) => { setCreatedFrom(val); setPage(1); },
    setCreatedTo: (val: string) => { setCreatedTo(val); setPage(1); },
    setPage,
    clearFilters,
    hasActiveFilters,
    activeFiltersCount,
  };
}

export function useWithdrawalFilters() {
  const [search, setSearch] = useQueryState("search", parseAsString.withDefault("").withOptions({ shallow: true }));
  const [status, setStatus] = useQueryState("status", parseAsString.withDefault("ALL").withOptions({ shallow: true }));
  const [createdFrom, setCreatedFrom] = useQueryState("createdFrom", parseAsString.withDefault("").withOptions({ shallow: true }));
  const [createdTo, setCreatedTo] = useQueryState("createdTo", parseAsString.withDefault("").withOptions({ shallow: true }));
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1).withOptions({ shallow: true }));

  const activeFiltersCount = [
    Boolean(search),
    status && status !== "ALL",
    Boolean(createdFrom),
    Boolean(createdTo),
  ].filter(Boolean).length;

  const hasActiveFilters = activeFiltersCount > 0;

  const clearFilters = () => {
    setSearch("");
    setStatus("ALL");
    setCreatedFrom("");
    setCreatedTo("");
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val || "");
    setPage(1);
  };

  return {
    filters: {
      search,
      status: status === "ALL" ? "" : status,
      createdFrom,
      createdTo,
    },
    raw: {
      search,
      status,
      createdFrom,
      createdTo,
      page,
    },
    setSearch: handleSearchChange,
    setStatus: (val: string) => { setStatus(val); setPage(1); },
    setCreatedFrom: (val: string) => { setCreatedFrom(val); setPage(1); },
    setCreatedTo: (val: string) => { setCreatedTo(val); setPage(1); },
    setPage,
    clearFilters,
    hasActiveFilters,
    activeFiltersCount,
  };
}

export function useCommissionFilters() {
  const [search, setSearch] = useQueryState("search", parseAsString.withDefault("").withOptions({ shallow: true }));
  const [status, setStatus] = useQueryState("status", parseAsString.withDefault("ALL").withOptions({ shallow: true }));
  const [source, setSource] = useQueryState("source", parseAsString.withDefault("ALL").withOptions({ shallow: true }));
  const [createdFrom, setCreatedFrom] = useQueryState("createdFrom", parseAsString.withDefault("").withOptions({ shallow: true }));
  const [createdTo, setCreatedTo] = useQueryState("createdTo", parseAsString.withDefault("").withOptions({ shallow: true }));
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1).withOptions({ shallow: true }));

  const activeFiltersCount = [
    Boolean(search),
    status && status !== "ALL",
    source && source !== "ALL",
    Boolean(createdFrom),
    Boolean(createdTo),
  ].filter(Boolean).length;

  const hasActiveFilters = activeFiltersCount > 0;

  const clearFilters = () => {
    setSearch("");
    setStatus("ALL");
    setSource("ALL");
    setCreatedFrom("");
    setCreatedTo("");
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val || "");
    setPage(1);
  };

  return {
    filters: {
      search,
      status: status === "ALL" ? "" : status,
      source: source === "ALL" ? "" : source,
      createdFrom,
      createdTo,
    },
    raw: {
      search,
      status,
      source,
      createdFrom,
      createdTo,
      page,
    },
    setSearch: handleSearchChange,
    setStatus: (val: string) => { setStatus(val); setPage(1); },
    setSource: (val: string) => { setSource(val); setPage(1); },
    setCreatedFrom: (val: string) => { setCreatedFrom(val); setPage(1); },
    setCreatedTo: (val: string) => { setCreatedTo(val); setPage(1); },
    setPage,
    clearFilters,
    hasActiveFilters,
    activeFiltersCount,
  };
}
