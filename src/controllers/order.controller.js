import prisma from "../prisma.js";

const createOrder = async (req, res) => {
  const { user_id, total_amount, status } = req.body;
  try {
    const order = await prisma.order.create({
      data: {
        user_id,
        total_amount,
        status,
      },
    });
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getOrders = async (req, res) => {
  const { page = 1, limit = 10, user_id } = req.query;
  const offset = (page - 1) * limit;

  try {
    const orders = await prisma.order.findMany({
      skip: offset,
      take: parseInt(limit),
      user_id,
    });

    const totalOrders = await prisma.order.count();
    const totalPages = Math.ceil(totalOrders / limit);

    res.status(200).json({
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalItems: totalOrders,
        totalPages,
      },
    });

    res.status(200).json(orders);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const checkOrderExists = async (id) => {
  const order = await prisma.order.findUnique({
    where: { id: parseInt(id) },
  });
  return order;
};

const getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await checkOrderExists(id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateOrder = async (req, res) => {
  const { id } = req.params;
  const { user_id, total_amount, status } = req.body;

  try {
    const order = await checkOrderExists(id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { user_id, total_amount, status },
    });
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await checkOrderExists(id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    await prisma.order.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export default {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
};
