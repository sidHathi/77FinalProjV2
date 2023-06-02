import { Box, Button, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import React from 'react';
import styles from './App.module.scss';
import Space from './Space';

import ParticleDisplay from "./Particles"

export default function App(): JSX.Element {

  const [scene, setScene] = useState('earth_day');
  const [simWidth, setSimWidth] = useState<number>();
  const [simHeight, setSimHeight] = useState<number>();
  console.log(scene)
  // console.log(document.getElementById('sim').getBoundingClientRect())
  // {console.log(document.getElementById('sim').getBoundingClientRect())}



  useEffect(() => {
    console.log(document.getElementById('sim').getBoundingClientRect().width)
    console.log(document.getElementById('sim').getBoundingClientRect().height)
    setSimHeight(document.getElementById('sim').getBoundingClientRect().height)
    setSimWidth(document.getElementById('sim').getBoundingClientRect().width)
    
  },[scene]);
  return (

    <Box className={styles.mainBox}>
      <Box className={styles.headerBox}>
        <Typography className={styles.header}> Fluid Simulations: Sid Hathi and Brody Thompson</Typography>
      </Box>

      <Box className={styles.simBox}>
        <Box className={styles.buttonBox}>
          <button className={styles.buttonSpec} onClick={() => setScene('earth_day')}>Earth (Day)</button>
          <button className={styles.buttonSpec} onClick={() => setScene('earth_night')}>Earth (Night)</button>
          <button className={styles.buttonSpec} onClick={() => setScene('jupiter')}>Jupiter</button>
          <button className={styles.buttonSpec} onClick={() => setScene('mars')}>Mars</button>
          <button className={styles.buttonSpec} onClick={() => setScene('satellite')}>Satellite</button>
          <button className={styles.buttonSpec} onClick={() => setScene('rings')} >Saturn Rings</button>
          <button className={styles.buttonSpec} onClick={() => setScene('saturn')}>Saturn</button>
          <button className={styles.buttonSpec} onClick={() => setScene('stars')}>Stars</button>

        </Box>

        <div className={styles.sim} id='sim'>
          <Space backdrop={scene as any} width={simWidth || 0} height={simHeight || 0} />
        </div>
      </Box>



    </Box>


  )
  

  // satelite, jupiter, amrs, earth day, saturns rings
  // saturn, stars, nightime earth
}
