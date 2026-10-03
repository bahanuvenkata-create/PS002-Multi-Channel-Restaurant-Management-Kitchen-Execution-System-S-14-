const cuisines = [
  { name: 'Andhra', emoji: '🌶️', color: 'from-red-500 to-orange-500' },
  { name: 'South Indian', emoji: '🥥', color: 'from-amber-400 to-orange-500' },
  { name: 'North Indian', emoji: '🍛', color: 'from-orange-500 to-amber-600' },
  { name: 'Italian', emoji: '🍕', color: 'from-red-400 to-rose-600' },
  { name: 'Chinese', emoji: '🍜', color: 'from-red-600 to-red-800' },
  { name: 'Fast Food', emoji: '🍔', color: 'from-yellow-400 to-orange-500' },
  { name: 'Continental', emoji: '🍝', color: 'from-blue-400 to-indigo-500' },
  { name: 'Punjabi', emoji: '🧈', color: 'from-yellow-500 to-amber-600' },
];

export default function CuisineExplorer({ onCuisineSelect, activeCuisine }) {
  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2 text-cream tracking-tight">Explore Cuisines</h2>
          <p className="text-soft font-light text-lg">Discover flavors from around the world.</p>
        </div>
        {activeCuisine && (
          <button 
            onClick={() => onCuisineSelect(null)}
            className="text-primary text-sm hover:underline"
          >
            Clear Filter
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {cuisines.map((cuisine) => (
          <div 
            key={cuisine.name}
            onClick={() => onCuisineSelect(cuisine.name)}
            className={`flex flex-col items-center justify-center p-4 bg-dark-card border rounded-2xl cursor-pointer hover:border-primary hover:shadow-lg hover:-translate-y-1 transition-all group ${activeCuisine === cuisine.name ? 'border-primary shadow-primary/20 shadow-lg' : 'border-dark-border'}`}
          >
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${cuisine.color} flex items-center justify-center text-3xl mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
              {cuisine.emoji}
            </div>
            <span className="font-semibold text-sm text-center text-gray-300 group-hover:text-white">
              {cuisine.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
