import Restaurant from "../models/Restaurant.js";


export const createRestaurant = async (req, res) => {
  try {

    const restaurant = await Restaurant.create({
      ...req.body,
      owner: req.user.id
    });

    res.status(201).json({
      success: true,
      restaurant
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getRestaurants = async (req, res) => {
  try {
    const { name, location, cuisine, price } = req.query;

    let query = {};

    if (name) {
      query.name = { $regex: name, $options: "i" };
    }

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    if (cuisine) {
      query.cuisine = { $regex: cuisine, $options: "i" };
    }

    if (price) {
      query.price = { $lte: Number(price) };
    }

    console.log("QUERY:", query);

    const restaurants = await Restaurant.find(query);

    res.json(restaurants);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRestaurantById = async (req, res) => {
  try {

    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.json({
      success: true,
      restaurant
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const updateRestaurant = async (req, res) => {
  try {

    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    if (restaurant.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updated = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      success: true,
      updated
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const deleteRestaurant = async (req, res) => {
  try {

    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    if (restaurant.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    await restaurant.deleteOne();

    res.json({
      success: true,
      message: "Restaurant deleted"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};