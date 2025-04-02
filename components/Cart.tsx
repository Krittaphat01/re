import { useState, useEffect } from "react";
import {
  Drawer,
  Typography,
  IconButton,
  ButtonBase,
  Box,
  Grid,
  Button,
} from "@mui/material";
import { Add, Remove, Delete } from "@mui/icons-material";
import ModalForm from "./ModalForm";
import { db, auth } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import axios from 'axios';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string; // เพิ่มรูปสินค้า
}

interface CartProps {
  open: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
}

const Cart: React.FC<CartProps> = ({ open, onClose, cartItems, updateQuantity, removeFromCart, clearCart }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [cartImages, setCartImages] = useState<{ [key: string]: string }>({});

  // รวมสินค้าซ้ำกันให้เป็นหนึ่งรายการ
  const mergedCartItems = cartItems.reduce((acc: CartItem[], item) => {
    const existingItem = acc.find((cartItem) => cartItem.id === item.id);
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      acc.push({ ...item });
    }
    return acc;
  }, []);

  // ฟังก์ชันสำหรับดึงข้อมูลรูปภาพจาก API
  const fetchCardImage = async (id: string) => {
    try {
      const response = await axios.get(`https://api.pokemontcg.io/v2/cards/${id}`, {
        headers: { "X-api-key": "bffbe7c7-cf5c-4854-9b63-b51f85a3616c" },
      });
      const imageUrl = response.data.data[0]?.images.small;
      if (imageUrl) {
        setCartImages((prevState) => ({ ...prevState, [id]: imageUrl }));
      }
    } catch (error) {
      console.error("Error fetching card image: ", error);
    }
  };

  // เรียกใช้ fetchCardImage เมื่อมีการเปลี่ยนแปลง cartItems
  useEffect(() => {
    mergedCartItems.forEach((item) => {
      if (!cartImages[item.id]) {
        fetchCardImage(item.id);
      }
    });
  }, [cartItems, cartImages, mergedCartItems]);

  // ฟังก์ชันสำหรับทำการชำระเงินและบันทึกคำสั่งซื้อ
  const handleCheckout = async (orderData: { customer: { name: string; address: string; phone: string; email?: string }; status: string }) => {
    try {
      const fullOrderData = {
        ...orderData,
        items: mergedCartItems,
        total: mergedCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        timestamp: new Date(),
      };
      await addDoc(collection(db, "orders"), fullOrderData);
      alert("คำสั่งซื้อสำเร็จ!");
      clearCart();
      setModalOpen(false);
      onClose();
    } catch (error) {
      console.error("Error adding order: ", error);
    }
  };

  const total = mergedCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
  const totalQuantity = mergedCartItems.reduce((sum, item) => sum + item.quantity, 0);


  return (
    <>
      <Drawer anchor="right" open={open} onClose={onClose}>
        <Box
          sx={{
            width: 500,
            height: 1000,
            padding: 2,
            backgroundColor: "#252836",
          }}
        >
          {/* หัวข้อ Cart และปุ่มปิด */}
          <Grid container justifyContent="space-between" alignItems="center">
            <Typography variant="h4" color="white">
              Cart
            </Typography>
            <ButtonBase
              sx={{
                width: 50,
                height: 50,
                display: "flex",
                alignItems: "center",
                backgroundColor: "#EA7C69",
                borderRadius: "8px",
                color: "white",
                fontSize: "16px",
                boxShadow: "0px 6px 20px rgba(255, 99, 71, 0.8)",
              }}
              onClick={onClose}
            >
              <Typography variant="button">X</Typography>
            </ButtonBase>
          </Grid>

          {/* ปุ่มล้างตะกร้า */}
          <Button
            variant="contained"
            color="error"
            onClick={clearCart}
            sx={{
              backgroundColor: "#EA7C69",
              "&:hover": { backgroundColor: "#ff4500", opacity: 0.8 },
              color: "white",
              marginY: 2,
            }}
          >
            Clear all
          </Button>

          {/* แสดงสินค้าในตะกร้า */}
          {mergedCartItems.length === 0 ? (
            <Typography color="white" sx={{ mt: 2 }}>
              ตะกร้าว่างเปล่า
            </Typography>
          ) : (
            <Grid container spacing={2} sx={{ maxHeight: "500px", overflowY: "auto" }}>
              {mergedCartItems.map((item) => (
                <Grid container spacing={2} alignItems="center" key={item.id}>
                  {/* รูปภาพสินค้า */}
                  <Grid item xs={2}>
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: 100,
                        height: 40,
                        objectFit: "contain"
                      }}
                    />
                  </Grid>
                  {/* ชื่อสินค้า และราคาต่อชิ้น */}
                  <Grid item xs={4}>
                    <Typography variant="body2" sx={{ color: "white", textAlign: "center" }}>
                      {item.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "gray", textAlign: "center" }}>
                      ฿{item.price.toFixed(2)}
                    </Typography>
                  </Grid>

                  {/* จำนวน และราคารวม */}
                  <Grid item xs={4}>
                    <Typography variant="body2" sx={{ color: "white", textAlign: "center" }}>
                      ฿{(item.price * item.quantity).toFixed(2)}
                    </Typography>
                  </Grid>

                  {/* ปุ่มเพิ่ม/ลด จำนวน */}
                  <Grid item xs={12} sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2, marginTop: 2 }}>
                    <Button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} size="small">
                      <Remove />
                    </Button>
                    <Box sx={{ width: 30, textAlign: "center", color: "white" }}>{item.quantity}</Box>
                    <Button onClick={() => updateQuantity(item.id, item.quantity + 1)} size="small">
                      <Add />
                    </Button>
                    <IconButton onClick={() => removeFromCart(item.id)} color="error">
                      <Delete />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
            </Grid>

          )}

          {/* รวมจำนวนสินค้าและราคารวม */}
          <Typography variant="h6" color="white" sx={{ mt: 2 }}>
            Total Quantity: {totalQuantity}
          </Typography>
          <Typography variant="h6" color="white">
            Total: ฿{total}
          </Typography>

          {/* ปุ่มชำระเงิน */}
          <ButtonBase
            sx={{
              width: "100%",
              height: 50,
              backgroundColor: "#EA7C69",
              color: "white",
              fontSize: "16px",
              boxShadow: "0px 6px 20px rgba(255, 99, 71, 0.8)",
              "&:hover": { backgroundColor: "#ff4500", transform: "translateY(-2px)" },
            }}
            onClick={() => setModalOpen(true)}
          >
            CONTINUE TO PAYMENT
          </ButtonBase>
        </Box>
      </Drawer>

      {/* Modal สำหรับบันทึกข้อมูลลูกค้า */}
      <ModalForm open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleCheckout} cartItems={mergedCartItems} currentUser={auth.currentUser} />
    </>
  );
};

export default Cart;
