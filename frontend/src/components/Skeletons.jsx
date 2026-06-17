import React from 'react';

export function MovieGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="bg-[#161616] rounded-2xl overflow-hidden border border-white/5 shadow-lg animate-pulse">
          {/* Poster Box skeleton */}
          <div className="h-80 bg-zinc-800"></div>
          {/* Details skeleton */}
          <div className="p-5 space-y-4">
            <div className="h-6 bg-zinc-800 rounded w-3/4"></div>
            <div className="flex justify-between items-center">
              <div className="h-4 bg-zinc-800 rounded w-1/4"></div>
              <div className="h-4 bg-zinc-800 rounded w-1/4"></div>
            </div>
            <div className="h-8 bg-zinc-800 rounded-xl w-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function MovieDetailsSkeleton() {
  return (
    <div className="py-10 max-w-6xl mx-auto animate-pulse space-y-12">
      {/* Main Banner skeleton */}
      <div className="bg-[#161616] rounded-3xl overflow-hidden border border-white/5 flex flex-col md:flex-row h-[450px]">
        <div className="md:w-1/3 bg-zinc-800 h-full"></div>
        <div className="p-10 md:w-2/3 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="h-12 bg-zinc-800 rounded w-1/2"></div>
            <div className="flex gap-3">
              <div className="h-6 bg-zinc-800 rounded-full w-20"></div>
              <div className="h-6 bg-zinc-800 rounded-full w-24"></div>
              <div className="h-6 bg-zinc-800 rounded-full w-24"></div>
            </div>
            <div className="space-y-2 pt-4">
              <div className="h-4 bg-zinc-800 rounded w-full"></div>
              <div className="h-4 bg-zinc-800 rounded w-5/6"></div>
              <div className="h-4 bg-zinc-800 rounded w-4/5"></div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8">
            <div className="h-10 bg-zinc-800 rounded w-1/3"></div>
          </div>
        </div>
      </div>

      {/* Showtimes skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 bg-[#161616] p-8 rounded-3xl border border-white/5 space-y-6">
          <div className="h-8 bg-zinc-800 rounded w-1/2"></div>
          <div className="space-y-4">
            <div className="h-20 bg-zinc-800 rounded-2xl"></div>
            <div className="h-20 bg-zinc-800 rounded-2xl"></div>
          </div>
        </div>
        <div className="lg:col-span-7 bg-[#161616] p-8 rounded-3xl border border-white/5 h-[300px]"></div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="py-8 animate-pulse space-y-10">
      <div className="h-32 bg-zinc-900 border border-white/5 rounded-3xl"></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="h-24 bg-zinc-900 border border-white/5 rounded-2xl"></div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 h-80 bg-zinc-900 border border-white/5 rounded-3xl"></div>
        <div className="lg:col-span-5 h-80 bg-zinc-900 border border-white/5 rounded-3xl"></div>
      </div>
    </div>
  );
}
