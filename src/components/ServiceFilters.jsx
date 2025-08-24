// In your ServiceFilters.jsx file
const filters = [
    { id: 'all', label: 'All Services', image: '/images/service-icons/all.svg' }, 
    { id: 'pharmacy', label: 'Pharmacies', image: '/images/service-icons/pharmacy.svg' },
    { id: 'grocery', label: 'Grocery Stores', image: '/images/service-icons/grocery.svg' },
    { id: 'restaurant', label: 'Restaurants', image: '/images/service-icons/restaurant.svg' },
    { id: 'mall', label: 'Shopping Malls', image: '/images/service-icons/mall.svg' },
    { id: 'market', label: 'Markets', image: '/images/service-icons/market.svg' },
    { id: 'hospital', label: 'Hospitals', image: '/images/service-icons/hospital.svg' },
    { id: 'gas', label: 'Gas Stations', image: '/images/service-icons/gas.svg' }
];


export const ServiceFilters = ({ activeFilter, onFilterChange }) => {
    return (
        <div className=" rounded-[15px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.1)] ">
            <div className="flex flex-wrap gap-1.5 justify-center">
                {filters.map(filter => (
                  <button
                    key={filter.id}
                    className={`
                        relative
                        flex
                        flex-col
                        items-center
                        justify-between
                        p-4
                        border-2
                        border-gray-300
                        w-30
                        h-30
                        rounded-3xl
                        bg-white
                        cursor-pointer
                        transition-all
                        duration-300
                        text-sm
                        flex-auto
                        min-w-[100px]
                        max-w-[150px]
                        shadow-md
                        overflow-hidden
                        hover:border-blue-600
                        hover:-translate-y-1
                        hover:shadow-lg
                        ${activeFilter === filter.id ? 'bg-gradient-to-br from-blue-600 to-purple-700 text-white border-blue-600 shadow-xl' : ''}
                    `}
                     onClick={() => onFilterChange(filter.id)}
                    > 
                        <img
                            class="
                                absolute
                                inset-0
                                w-full
                                h-full
                                object-cover
                                opacity-80
                                transition-opacity
                                duration-300
                                hover:border-blue-600
                                hover:translate-y-[-3px]
                                hover:shadow-lg
                            "
                        src={filter.image} alt={filter.label}
                        />
                        {/* <img src={filter.image} alt={filter.label} className="filter-image" /> */}
                        
                    </button>
                ))}
            </div>
        </div>
    );
};