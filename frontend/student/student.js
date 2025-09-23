// Student-specific logic
document.addEventListener('DOMContentLoaded', () => {
    console.log('Student frontend loaded successfully.');

    // --- Dynamic Content Loading (Dashboard and Menu) ---
    const menuCategories = [
        { name: 'Snacks', image: 'https://placehold.co/150x150/ffc107/000000?text=Snacks' },
        { name: 'Beverages', image: 'https://placehold.co/150x150/007bff/ffffff?text=Beverages' },
        { name: 'Main Course', image: 'https://placehold.co/150x150/28a745/ffffff?text=Main+Course' },
        { name: 'Desserts', image: 'https://placehold.co/150x150/dc3545/ffffff?text=Desserts' }
    ];

    const menuItems = [
        { name: 'Spicy Chicken Burger', price: 80, image: 'https://placehold.co/400x250/5c6ac4/ffffff?text=Burger', status: 'Available' },
        { name: 'Cold Coffee', price: 45, image: 'https://placehold.co/400x250/007bff/ffffff?text=Coffee', status: 'Available' },
        { name: 'Veggie Pizza Slice', price: 60, image: 'https://placehold.co/400x250/ffc107/000000?text=Pizza', status: 'Unavailable' }
    ];

    const menuCategoriesContainer = document.getElementById('menu-categories');
    if (menuCategoriesContainer) {
        menuCategories.forEach(category => {
            const card = document.createElement('div');
            card.className = 'bg-white rounded-3xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform cursor-pointer';
            card.innerHTML = `
                <img src="${category.image}" alt="${category.name}" class="w-full h-32 object-cover">
                <div class="p-4 text-center">
                    <h3 class="font-bold text-lg">${category.name}</h3>
                </div>
            `;
            menuCategoriesContainer.appendChild(card);
        });
    }

    const menuGridContainer = document.getElementById('menu-grid');
    if (menuGridContainer) {
        menuItems.forEach(item => {
            const card = document.createElement('div');
            const statusColor = item.status === 'Available' ? 'bg-green-500' : 'bg-red-500';
            const buttonText = item.status === 'Available' ? 'Order Now' : 'Unavailable';
            const buttonClass = item.status === 'Available' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed';
            const buttonDisabled = item.status !== 'Available';

            card.className = 'bg-white rounded-3xl shadow-lg overflow-hidden flex flex-col';
            card.innerHTML = `
                <div class="relative">
                    <img src="${item.image}" alt="${item.name}" class="w-full h-40 object-cover">
                    <span class="absolute top-3 right-3 text-white text-xs font-semibold px-3 py-1 rounded-full ${statusColor}">${item.status}</span>
                </div>
                <div class="p-6 flex-1 flex flex-col justify-between">
                    <div>
                        <h3 class="font-bold text-lg">${item.name}</h3>
                        <p class="text-gray-500 text-sm mb-4">A classic item from our menu.</p>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-2xl font-bold text-blue-600">₹${item.price}</span>
                        <a href="item-details.html" class="text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors transform hover:scale-105 ${buttonClass}">${buttonText}</a>
                    </div>
                </div>
            `;
            menuGridContainer.appendChild(card);
        });
    }
});
