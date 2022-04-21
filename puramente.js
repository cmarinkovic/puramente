const axios = require("axios");
const dayjs = require("dayjs");

function getDiasMeditados(meditacionesUsuario) {
  const fechasMeditaciones = [];

  meditacionesUsuario.forEach((meditacion) => {
    const fechaMeditacion = dayjs(meditacion.dateSession).format("YYYY-MM-DD");

    if (
      !fechasMeditaciones.includes(fechaMeditacion) &&
      meditacion.isSessionCompleted
    ) {
      fechasMeditaciones.push(fechaMeditacion);
    }
  });

  return fechasMeditaciones.sort((a, b) => new Date(a) - new Date(b));
}

function getRachas(fechasMeditaciones) {
  const rachas = [];
  let racha;

  if (fechasMeditaciones.length > 1) {
    // Se crea una racha con el primer elemento del arreglo.
    racha = {
      inicio: fechasMeditaciones[0],
      fin: fechasMeditaciones[0],
      diasMeditando: 1,
    };

    for (let i = 1; i < fechasMeditaciones.length; i++) {
      // Se itera desde el segundo elemento para ver si hay rachas de una o más días.

      const fechaAnterior = dayjs(fechasMeditaciones[i - 1]);
      const fechaActual = dayjs(fechasMeditaciones[i]);
      const diferenciaDias = fechaActual.diff(fechaAnterior, "day");

      if (diferenciaDias === 1) {
        /* Si hay 1 día de diferencia entre la fecha actual y 
        la anterior, entonces se cuenta un día más en la racha. */

        racha.diasMeditando = racha.diasMeditando + 1;
        racha.fin = fechasMeditaciones[i];
      } else {
        /* Hay más de 1 día de diferencia entre la fecha actual y 
        la anterior, entonces se debe guardar la racha anterior
        y crear una nueva racha. */

        rachas.push(racha);

        racha = {
          inicio: fechasMeditaciones[i],
          fin: fechasMeditaciones[i],
          diasMeditando: 1,
        };
      }
    }

    rachas.push(racha);

    return rachas;
  } else {
    return rachas;
  }
}

function getRachaActual(rachas, hoy) {
  const rachaActual = rachas.filter((racha) => racha.fin === hoy);

  if (rachaActual.length) {
    return rachaActual[0];
  } else {
    return;
  }
}

function getRachaActualNum(rachas, hoy) {
  const rachaActual = getRachaActual(rachas, hoy);

  if (rachaActual) {
    return rachaActual.diasMeditando;
  } else {
    return 0;
  }
}

function getRachasMaximas(rachas) {
  // Se contempla la posibilidad de que haya más de una racha con la misma cantidad de días.

  let mayorDiasMeditando = 0;
  let rachasMaximas = [];

  rachas.forEach((racha) => {
    if (racha.diasMeditando > mayorDiasMeditando) {
      // Se encuentra una racha mayor a la/las guardadas.

      mayorDiasMeditando = racha.diasMeditando;
      rachasMaximas = [];
      rachasMaximas.push(racha);
    } else if (racha.diasMeditando === mayorDiasMeditando) {
      // Se encuentra una racha igual a la/las guardadas.

      rachasMaximas.push(racha);
    }
  });

  return rachasMaximas;
}

function getRachaMaximaNum(rachas) {
  const rachasMaximas = getRachasMaximas(rachas);

  /* Basta con recuperar el primer elemento del arreglo rachasMaximas
    para obtener los días meditados.
  */
  if (rachasMaximas.length) {
    return rachasMaximas[0].diasMeditando;
  } else {
    return 0;
  }
}

axios
  .get(
    "https://gist.githubusercontent.com/nahuelb/0af04ce9aadab10afe2f37ba566070c2/raw/47effc9a678e9616369b56eeeb4ee54f22763b21/sessions.json"
  )
  .then((response) => {
    const diasMeditados = getDiasMeditados(response.data);
    const rachas = getRachas(diasMeditados);
    const rachaActualNum = getRachaActualNum(rachas, "2022-01-25");
    const rachaMaximaNum = getRachaMaximaNum(rachas);

    console.log("Racha actual: " + rachaActualNum);
    console.log("Racha máxima: " + rachaMaximaNum);

    /*
    const rachaActual = getRachaActual(rachas, "2022-01-25");
    
    //Mostrar racha actual si la hay.
    if (rachaActual) {
      console.log(
        `Racha actual: ${rachaActual.diasMeditando} \n 
          Fechas: ${dayjs(rachaActual.inicio).format("DD/MM/YYYY")} - 
          ${dayjs(rachaActual.fin).format("DD/MM/YYYY")}`
      );
    } else {
      console.log("Racha actual: " + rachaActual); //0
    }

    const rachasMaximas = getRachasMaximas(rachas);

    //Mostrar rachas máximas.
    if (rachasMaximas.length) {
      console.log("\nRachas máximas");

      rachasMaximas.forEach((racha) => {
        console.log(
          `Racha: ${racha.diasMeditando} \n
            Fechas: ${dayjs(racha.inicio).format("DD/MM/YYYY")} - ${dayjs(
            racha.fin
          ).format("DD/MM/YYYY")}`
        );
      });
    } else {
      console.log("No hay rachas anteriores.");
    } */
  })
  .catch((error) => console.log(error));
