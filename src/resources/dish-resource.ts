// Method to get dishes, modified to use locale-aware sorting
function getDishes(dishes) {
    return dishes.sort((a, b) => a.name.localeCompare(b.name, 'lt', { sensitivity: 'base' }));
}

// Method to get filtered dishes, modified to use locale-aware sorting
function getFilteredDishes(dishes, filter) {
    return dishes.filter(dish => dish.name.includes(filter)).sort((a, b) => a.name.localeCompare(b.name, 'lt', { sensitivity: 'base' }));
}