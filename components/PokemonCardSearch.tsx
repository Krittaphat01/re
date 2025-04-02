import React, { useState, useEffect } from 'react';
import { Card, CardMedia, Typography, Box, Button, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';

interface CardType {
  id: string;
  name: string;
  images: { large: string };
  price: number;
  quantity?: number;
}

interface ProductCardProps {
  cardId: string;
  addToCart: (card: CardType) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ cardId, addToCart }) => {
  const [cardData, setCardData] = useState<CardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCardData = async () => {
      if (!cardId) {
        setError('No card ID provided');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`https://api.pokemontcg.io/v2/cards/${cardId}`, {
          headers: { "X-api-key": "bffbe7c7-cf5c-4854-9b63-b51f85a3616c" }
        });

        const card = response.data.data;

        // คำนวณราคาการ์ด
        const normalPrice = card?.tcgplayer?.prices?.normal?.market ?? 0;
        const holofoilPrice = card?.tcgplayer?.prices?.holofoil?.market ?? 0;
        const reverseHolofoilPrice = card?.tcgplayer?.prices?.reverseHolofoil?.market ?? 0;

        const price = Math.max(normalPrice, holofoilPrice, reverseHolofoilPrice);

        setCardData({
          id: card.id,
          name: card.name,
          images: { large: card.images.large },
          price, // กำหนดราคาที่ถูกต้อง
        });
      } catch (error) {
        setError(
          axios.isAxiosError(error) && error.response
            ? `Error: ${error.response.status} - ${error.response.statusText}`
            : 'Failed to load card data. Please try again later.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCardData();
  }, [cardId]);

  if (loading) return <CircularProgress sx={{ display: 'block', margin: 'auto', marginTop: '20px' }} />;
  if (error) return <Alert severity="error" sx={{ margin: '20px auto', width: '80%' }}>{error}</Alert>;
  if (!cardData) return <Alert severity="warning" sx={{ margin: '20px auto', width: '80%' }}>Card not found</Alert>;

  return (
    <Card sx={{ maxWidth: 250, backgroundColor: 'transparent', boxShadow: 'none', textAlign: 'center' }}>
      <CardMedia
        component="img"
        image={cardData.images.large}
        alt={cardData.name}
        sx={{ width: '100%', height: 140, objectFit: 'contain', marginTop: '25px' }}
      />
      <Box sx={{
        backgroundColor: '#0b0c16',
        borderRadius: '16px',
        padding: '8px',
        color: 'white',
        textAlign: 'center',
        width: '160px',
        height: '170px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        margin: '0 auto',
      }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', marginTop: "25px" }}>
          {cardData.name}
        </Typography>
        <Typography variant="caption" sx={{ color: 'lightgray' }}>
          {cardData.price > 0 ? `$${cardData.price.toFixed(2)}` : 'Price not available'}
        </Typography>

        <Button
          variant="contained"
          fullWidth
          size="small"
          sx={{
            color: 'white',
            backgroundColor: '#4F4F4F',
            opacity: 0.7,
            '&:hover': { backgroundColor: '#3333FF', opacity: 1 },
          }}
          onClick={() => addToCart({ ...cardData, quantity: 1 })}
        >
          <LocalMallOutlinedIcon sx={{ marginRight: '8px' }} />
          Add to Cart
        </Button>
      </Box>
    </Card>
  );
};

export default ProductCard;
