'use client'
import { useState, useEffect } from 'react'
import { Box, Stack, Typography, Button, Modal, TextField } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import DeleteIcon from '@mui/icons-material/Delete'
import { firestore } from '@/firebase'
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore'

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: '#f5f5f5', // Light gray
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}

const inventoryItemStyle = {
  backgroundColor: '#ffffff', // White background
  borderRadius: '8px',
  padding: '16px',
  display: 'flex',
  alignItems: 'center',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // More noticeable shadow
  gap: 2, // Space between item details and count
}

const inventoryCountStyle = {
  flexGrow: 1,
  textAlign: 'right',
  fontSize: '1.5rem', // Larger font size for the count
}

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() })
    })
    setInventory(inventoryList)
  }
  
  useEffect(() => {
    updateInventory()
  }, [])

  const addItem = async (item, expiry) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    const validExpiry = expiry || '';

    if (docSnap.exists()) {
      const { count } = docSnap.data()
      await setDoc(docRef, { count: count + 1, expiry: validExpiry })
    } else {
      await setDoc(docRef, { count: 1, expiry: validExpiry })
    }
    await updateInventory()
  }
  
  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const { count, expiry } = docSnap.data()
      if (count > 1) {
        await setDoc(docRef, { count: count - 1, expiry })
      } else {
        await deleteDoc(docRef)
      }
    }
    await updateInventory()
  }

  const deleteItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    await deleteDoc(docRef)
    await updateInventory()
  }

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      justifyContent="center"
      flexDirection="column"
      alignItems="center"
      gap={4}
      bgcolor="#f0f0f0" // Light neutral background
      padding={4}
      position="relative" // Make sure the header can be positioned relative to this container
    >
      <Typography
        variant="h3" // Larger font size
        sx={{
          color: '#1E88E5', // Blue color
          fontWeight: 'bold',
          textAlign: 'center', // Center the text
        }}
      >
        Sustainable Fridge
      </Typography>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ textAlign: 'center', color: '#333333', fontWeight: 'bold' }}>
            Add Item
          </Typography>
          <Stack width="100%" direction={'row'} spacing={2}>
            <TextField
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <TextField
              label="Expiry Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </Stack>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => {
              addItem(itemName, expiryDate)
              setItemName('')
              setExpiryDate('')
              handleClose()
            }}
            sx={{ mt: 2, bgcolor: '#b0bec5', '&:hover': { bgcolor: '#9e9e9e' } }} // Neutral button color with blue touch
          >
            Add
          </Button>
        </Box>
      </Modal>

      <Stack direction="column" spacing={2} alignItems="center" mt={8}>
        <Typography variant="h6" sx={{ color: '#1E88E5', fontWeight: 'bold' }}>
          Track Inventory
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            label="Search Item"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearch}
            sx={{ width: '300px' }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpen}
            sx={{
              width: '50px',
              height: '50px',
              minWidth: 'auto',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              bgcolor: '#90caf9', // Light blue button
              '&:hover': { bgcolor: '#64b5f6' }, // Darker blue on hover
            }}
          >
            <AddIcon sx={{ fontSize: 30, color: '#ffffff' }} />
          </Button>
        </Stack>
      </Stack>

      <Box width="800px" borderRadius="8px" boxShadow="0 4px 8px rgba(0, 0, 0, 0.2)" bgcolor="#ffffff" padding={2} mt={4}>
        <Stack width="100%" height="300px" spacing={2} overflow="auto">
          {filteredInventory.map(({ name, count, expiry }) => (
            <Box
              key={name}
              sx={inventoryItemStyle}
            >
              <Stack direction="column" spacing={1}>
                <Typography variant={'h6'} color={'#333333'}>
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography variant={'body1'} color={'#555555'}>
                  Expiry: {expiry || 'N/A'}
                </Typography>
              </Stack>
              <Typography variant={'h5'} sx={inventoryCountStyle} color={'#333333'}>
                {count}
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => addItem(name, expiry)}
                  sx={{
                    minWidth: 'auto',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    bgcolor: '#e0e0e0',
                    color: '#333333',
                    '&:hover': {
                      bgcolor: '#bdbdbd',
                    },
                  }}
                >
                  <AddIcon sx={{ fontSize: 24 }} />
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => removeItem(name)}
                  sx={{
                    minWidth: 'auto',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    bgcolor: '#e0e0e0',
                    color: '#333333',
                    '&:hover': {
                      bgcolor: '#bdbdbd',
                    },
                  }}
                >
                  <RemoveIcon sx={{ fontSize: 24 }} />
                </Button>
                <Button
                  sx={{
                    minWidth: 'auto',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    color: '#64b5f6', // Lighter blue color for the icon
                    borderColor: 'transparent', // No border
                    backgroundColor: 'transparent', // Transparent background
                    '&:hover': {
                      backgroundColor: '#e3f2fd', // Light blue background on hover
                    },
                  }}
                  onClick={() => deleteItem(name)}
                >
                  <DeleteIcon sx={{ fontSize: 24 }} />
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  )
}
