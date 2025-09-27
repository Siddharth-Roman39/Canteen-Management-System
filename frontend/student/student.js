// This event listener ensures the script runs only after the entire HTML page has loaded.
document.addEventListener('DOMContentLoaded', () => {
    console.log('Student frontend scripts loaded successfully.');

    // --- LOGIC FOR THE DASHBOARD PAGE (dashboard.html) ---

    // Find the container for the live order queue.
    const orderQueueContainer = document.getElementById('order-queue');

    // This 'if' block ensures the following code only runs if we are on a page
    // that actually has the 'order-queue' element (like our dashboard).
    if (orderQueueContainer) {
        // Sample data for the live queue. In a real application, this would come from a server.
        const liveOrders = [
            { id: '#7891', status: 'Preparing' },
            { id: '#7890', status: 'Ready for pickup' },
            { id: '#7889', status: 'Accepted' },
            { id: '#7888', status: 'Preparing' },
        ];

        // Clear the static placeholder list items from the HTML.
        orderQueueContainer.innerHTML = '';

        // Loop through the sample data and create a list item for each order.
        liveOrders.forEach(order => {
            const listItem = document.createElement('li');
            listItem.className = 'flex items-center';

            let statusColorClass = '';
            let pulseAnimation = '';

            // Determine the color and animation for the status dot.
            switch (order.status) {
                case 'Preparing':
                    statusColorClass = 'bg-yellow-400';
                    pulseAnimation = 'animate-pulse';
                    break;
                case 'Ready for pickup':
                    statusColorClass = 'bg-green-500';
                    break;
                case 'Accepted':
                    statusColorClass = 'bg-blue-500';
                    break;
            }

            // Create the HTML for the list item.
            listItem.innerHTML = `
                <span class="${statusColorClass} ${pulseAnimation} w-2 h-2 rounded-full mr-3"></span>
                <div>
                    <p class="text-sm font-semibold">Order ${order.id}</p>
                    <p class="text-xs text-gray-500">${order.status}</p>
                </div>
            `;

            // Add the newly created list item to the queue.
            orderQueueContainer.appendChild(listItem);
        });
    }


    // --- LOGIC FOR THE MENU PAGE (menu.html) ---

    // This is the code we created earlier. It will only run on a page that has a 'menu-grid' element.
    const menuGridContainer = document.getElementById('menu-grid');
    if (menuGridContainer) {
        const menuItems = [
            { name: 'Samosa (2 pcs)', price: 25, image: 'https://placehold.co/400x250/f0ad4e/ffffff?text=Samosa', status: 'Available' },
            { name: 'Veg Thali', price: 90, image: 'https://placehold.co/400x250/28a745/ffffff?text=Thali', status: 'Available' },
            { name: 'Masala Dosa', price: 50, image: 'https://placehold.co/400x250/d9534f/ffffff?text=Dosa', status: 'Available' },
            { name: 'Chole Bhature', price: 70, image: 'https://placehold.co/400x250/5bc0de/ffffff?text=Chole+Bhature', status: 'Unavailable' },
            { name: 'Veg Noodles', price: 60, image: 'https://placehold.co/400x250/9c27b0/ffffff?text=Noodles', status: 'Available' },
            { name: 'Masala Chai', price: 15, image: 'https://placehold.co/400x250/6c757d/ffffff?text=Chai', status: 'Available' }
        ];

        menuItems.forEach(item => {
            const card = document.createElement('div');
            const statusColor = item.status === 'Available' ? 'bg-green-500' : 'bg-red-500';
            const buttonText = item.status === 'Available' ? 'Order Now' : 'Unavailable';
            const buttonClass = item.status === 'Available' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed';

            card.className = 'bg-white rounded-3xl shadow-lg overflow-hidden flex flex-col';
            card.innerHTML = `
                <div class="relative">
                    <img src="${item.image}" alt="${item.name}" class="w-full h-40 object-cover">
                    <span class="absolute top-3 right-3 text-white text-xs font-semibold px-3 py-1 rounded-full ${statusColor}">${item.status}</span>
                </div>
                <div class="p-6 flex-1 flex flex-col justify-between">
                    <div>
                        <h3 class="font-bold text-lg">${item.name}</h3>
                        <p class="text-gray-500 text-sm mb-4">A delicious item from our canteen.</p>
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