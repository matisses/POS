(function () {
    var urlRest = 'http://tressesenta.matisses.co:8080/360/webresources/';
    var app = angular.module('360POS', []);
    app.controller('POSController', function ($scope, $http) {

        ///////////////////////////////////////////////////////////////////////////////
        ////////////////// Informacion sesion /////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////
        $scope.estadoValidacion = 0;
        $scope.sesionValida = false;
        $scope.nombreEmpleado = null;
        $scope.almacen = null;
        $scope.sessionId = null;
        $scope.cajaAbierta = false;
        $scope.cuentaEfectivo = null;
        var estadoInterval = setInterval(function () {
            try {
                if (window.location.search) {
                    $scope.consultarDatosSesion();
                }
            } catch (error) {
                clearInterval(estadoInterval);
            }
        }, 800);

        $scope.consultarDatosSesion = function () {
            $scope.sessionId = window.location.search.substring(11, window.location.search.length);
            $http.get(urlRest + 'session/' + $scope.sessionId)
                .then(function (response) {
                    $scope.estadoValidacion = 1;
                    clearInterval(estadoInterval);
                    if (response.data) {
                        console.log(response.data);
                        $scope.nombreEmpleado = response.data.usuario;
                        $scope.almacen = response.data.almacen;
                        $scope.sesionValida = response.data.sesionValida;
                        $scope.mensajeErrorSesion = response.data.mensajeError;
                        $scope.cajaAbierta = response.data.cajaAbierta;
                        $scope.ipCaja = response.data.ip;
                        $scope.cuentaEfectivo = response.data.cuentaEfectivo;
                        $scope.cargarTiposTarjeta();
                        $scope.nombreCaja = response.data.nombreCaja;
                        $scope.idTurnoCaja = response.data.idTurnoCaja;
                        $scope.saldoTarjetaRegalo = response.data.tarjetasRegaloDisponibles;
                    }
                })
                .catch(function (data, status) {
                    $('#servicioNoDisponible').modal({
                        backdrop: 'static',
                        keyboard: false,
                        show: true
                    });
                    clearInterval(estadoInterval);
                });
        };

        ///////////////////////////////////////////////////////////////////////////////
        ////////////////// Caja ///////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////

        $scope.denominaciones = [
            {
                tipo: 'Moneda',
                valor: 50,
                urlImagen: 'img/nueva_50_sello_235_1.jpg',
                cantidad: 0
            },
            {
                tipo: 'Moneda',
                valor: 100,
                urlImagen: 'img/nueva_100_sello_235.jpg',
                cantidad: 0
            },
            {
                tipo: 'Moneda',
                valor: 200,
                urlImagen: 'img/nueva_200_sello_235.jpg',
                cantidad: 0
            },
            {
                tipo: 'Moneda',
                valor: 500,
                urlImagen: 'img/nueva_500_sello_235.jpg',
                cantidad: 0
            },
            {
                tipo: 'Moneda',
                valor: 1000,
                urlImagen: 'img/nueva_1000_sello_235.jpg',
                cantidad: 0
            },
            {
                tipo: 'Billete',
                valor: 1000,
                urlImagen: 'img/b1000-re.jpeg',
                cantidad: 0
            },
            {
                tipo: 'Billete',
                valor: 2000,
                urlImagen: 'img/b2000-re.jpeg',
                cantidad: 0
            },
            {
                tipo: 'Billete',
                valor: 5000,
                urlImagen: 'img/b5000-re.jpeg',
                cantidad: 0
            },
            {
                tipo: 'Billete',
                valor: 10000,
                urlImagen: 'img/b10000-re.jpeg',
                cantidad: 0
            },
            {
                tipo: 'Billete',
                valor: 20000,
                urlImagen: 'img/b20000-re.jpeg',
                cantidad: 0
            },
            {
                tipo: 'Billete',
                valor: 50000,
                urlImagen: 'img/b50000-re.jpeg',
                cantidad: 0
            },
            {
                tipo: 'Billete',
                valor: 100000,
                urlImagen: 'img/b100000-re.jpeg',
                cantidad: 0
            }
        ];

        $scope.totalCompra = 0;
        $scope.totalApertura = 0;
        $scope.cantidadDenominacionSeleccionada = null;
        $scope.denominacionSeleccionada = null;
        $scope.errorMontoCierreCaja = null;
        $scope.errorMontoAperturaCaja = null;
        $scope.saldoActualCaja = null;
        $scope.valorUltimoDeposito = null;

        $scope.seleccionarDenominacion = function (denominacion) {
            $scope.denominacionSeleccionada = denominacion;
            $scope.cantidadDenominacionSeleccionada = denominacion.cantidad;
        };

        $scope.abrirCaja = function () {
            $('#aperturaCierreCaja').modal('show');
            $scope.abrirCajonMonedero();
        };

        $scope.cerrarCaja = function () {
            $('#aperturaCierreCaja').modal('show');
            $scope.abrirCajonMonedero();
        };

        $scope.calcularTotalApertura = function () {
            $scope.totalApertura = 0;
            for (var i = 0; i < $scope.denominaciones.length; i++) {
                $scope.totalApertura += $scope.denominaciones[i].cantidad * $scope.denominaciones[i].valor;
            }
        };

        $scope.agregarCantidad = function (valor) {
            for (var i = 0; i < $scope.denominaciones.length; i++) {
                if ($scope.denominaciones[i].valor === $scope.denominacionSeleccionada.valor && $scope.denominaciones[i].tipo === $scope.denominacionSeleccionada.tipo) {
                    $scope.denominacionSeleccionada.cantidad = ($scope.denominacionSeleccionada.cantidad * 10) + valor;
                    $scope.cantidadDenominacionSeleccionada = ($scope.cantidadDenominacionSeleccionada * 10) + valor;
                    $scope.calcularTotalApertura();
                    break;
                }
            }
        };

        $scope.limpiarCantidad = function () {
            for (var i = 0; i < $scope.denominaciones.length; i++) {
                if ($scope.denominaciones[i].valor === $scope.denominacionSeleccionada.valor && $scope.denominaciones[i].tipo === $scope.denominacionSeleccionada.tipo) {
                    $scope.denominacionSeleccionada.cantidad = 0;
                    $scope.cantidadDenominacionSeleccionada = 0;
                    $scope.calcularTotalApertura();
                    break;
                }
            }
        };

        $scope.limpiarCantidades = function () {
            for (var i = 0; i < $scope.denominaciones.length; i++) {
                $scope.denominaciones[i].cantidad = 0;
            }
            $scope.denominacionSeleccionada = null;
            $scope.cantidadDenominacionSeleccionada = 0;
            $scope.calcularTotalApertura();
        };

        $scope.registrarOperacionCaja = function (transaccion) {
            $http.post(urlRest + 'caja/transaccion/', transaccion).then();
        };

        $scope.ejecutarAperturaCaja = function () {
            $scope.errorMontoAperturaCaja = null;
            $scope.cajaAbierta = false;
            if ($scope.totalApertura !== 400000) {
                $scope.errorMontoAperturaCaja = 'El monto para abrir la caja no puede ser diferente de $400.000';
                return;
            }
            var transaccion = {
                usuario: $scope.nombreEmpleado,
                tipo: 'apertura',
                valor: $scope.totalApertura
            };
            $http.post(urlRest + 'caja/transaccion/', transaccion).then(
                function (response) {
                    if (response.data) {
                        $scope.cajaAbierta = true;
                        $scope.limpiarCantidades();
                        $scope.consultarDatosSesion();
                        $('#aperturaCierreCaja').modal('hide');
                    }
                },
                function (response) {}
            );
        };

        $scope.crearDeposito = function (monto) {
            var transaccion = {
                usuario: $scope.nombreEmpleado,
                tipo: 'deposito',
                valor: monto,
                justificacion: null
            };
            return transaccion;
        };

        $scope.realizarUltimoDeposito = function () {
            var transacciones = [];
            var transaccion = {
                usuario: $scope.nombreEmpleado,
                tipo: 'cierre',
                valor: 400000,
                cierre: true
            };
            transacciones.push($scope.crearDeposito($scope.valorUltimoDeposito));
            transacciones.push(transaccion);
            $http.post(urlRest + 'caja/transacciones/', transacciones).then(
                function (response) {
                    if (response.data) {
                        $scope.cajaAbierta = false;
                        $scope.limpiarCantidades();
                        $('#ultimoDepositoCaja').modal('hide');
                        $scope.imprimirInformeCierre();
                    }
                },
                function (response) {}
            );
        };

        $scope.validarMontoCierre = function () {
            $scope.errorMontoCierreCaja = null;
            $scope.saldoActualCaja = null;
            //consultar total transacciones caja
            $http.post(urlRest + 'caja/saldo/', $scope.nombreEmpleado).then(
                function (response) {
                    if (response.data) {
                        $scope.saldoActualCaja = response.data;
                        //comparar valor consultado con valor ingresado
                        if ($scope.saldoActualCaja !== $scope.totalApertura) {
                            //si los valores no son iguales, mostrar mensaje de error en ventana de cierre/apertura
                            $scope.errorMontoCierreCaja = 'El monto ingresado no es el esperado. El valor en efectivo en la caja debe ser de ';
                        } else {
                            //si los valores son iguales, mostrar ventana de confirmacion de ultimo deposito
                            $scope.valorUltimoDeposito = $scope.saldoActualCaja - 400000;
                            $('#aperturaCierreCaja').modal('hide');
                            $('#ultimoDepositoCaja').modal({
                                backdrop: 'static',
                                keyboard: false,
                                show: true
                            });
                        }
                    }
                },
                function (response) {
                    $scope.errorMontoCierreCaja = 'Ocurrió un error al validar el saldo actual de la caja. Por favor comuníquese con el departamento de sistemas. ';
                    $scope.saldoActualCaja = -1;
                }
            );
        };

        $scope.imprimirInformeCierre = function () {
            //consultar datos cierre
            $http.post(urlRest + 'factura/consultarDatosCierre/' + $scope.almacen + '/' + $scope.idTurnoCaja).then(
                function (response) {
                    if (response.data) {
                        //imprimir informe de cierre (tirilla z)
                        $http.post(urlRest + 'caja/generarZ/' + $scope.nombreEmpleado + '/' + $scope.idTurnoCaja, response.data).then(
                            function (response2) {
                                if (response2.data) {
                                    var reportData = response2.data;
                                    console.log(reportData);
                                    reportData.caja = $scope.nombreCaja;
                                    $scope.imprimirZ(reportData);
                                } else {
                                    //TODO: mostrar mensaje de error
                                    console.error('no se recibio la informacion para imprimir la tirilla z');
                                }
                            },
                            function (responseError) {
                                console.log('error imprimiendo tirilla');
                                console.error(responseError);
                            }
                        );
                    } else {
                        //TODO: mostrar mensaje de error
                        console.error('no se recibio la informacion para imprimir la tirilla z');
                    }
                },
                function (response) {
                    console.log('error imprimiendo tirilla');
                }
            );
        };

        $scope.imprimirZ = function (reportData) {
            $http.post('http://' + $scope.ipCaja + ':8008/printZ/', reportData);
        };

        $scope.mostrarBotonPago = function () {
            return $scope.pagoPendiente === 0 && $scope.cliente !== null && $scope.cajaAbierta;
        };

        $scope.abrirCajonMonedero = function () {
            $http.get('http://' + $scope.ipCaja + ':8008/open/');
        };

        ///////////////////////////////////////////////////////////////////////////////
        ////////////////// Venta //////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////
        $scope.ventasPendientes = [];
        $scope.facturasAnulables = [];
        $scope.nfMensajeError = '';
        $scope.nfCodigoError = '0';
        $scope.faMensajeError = '';
        $scope.comentariosFactura = '';
        $scope.estadoPedido = null;
        $scope.estadoPedidoSeleccionado = 'Seleccione el estado...';
        $scope.modoCarrito = null;
        $scope.facturaAnularSeleccionada = null;

        $scope.seleccionarEstadoPedido = function (estado) {
            $scope.estadoPedido = estado;
            if (estado === 'P') {
                $scope.estadoPedidoSeleccionado = 'programar entrega';
            } else if (estado === 'D') {
                $scope.estadoPedidoSeleccionado = 'entrega inmediada';
            }
        };

        $scope.cerrarConfirmacionFacturaFallida = function () {
            $scope.nfCodigoError = '0';
            $scope.nfMensajeError = '';
            $('#confirmacionPago').modal('hide');
        };

        $scope.listarVentasHoy = function () {
            $scope.facturasAnulables = [];
            $http.get(urlRest + 'factura/anular/lista/' + $scope.idTurnoCaja)
                .then(function (response) {
                    if (response.data) {
                        if (response.data.code === '-1') {
                            $scope.faMensajeError = response.data.mensaje;
                        } else {
                            $scope.facturasAnulables = response.data.facturas;
                        }
                        $('#listaFacturasAnulables').modal('show');
                    } else {
                        console.error('No se encontraron facturas aptas para ser anuladas');
                    }
                });
        };

        $scope.seleccionarFacturaAnular = function (factura) {
            $scope.facturaAnularSeleccionada = factura;
        };

        $scope.anularFacturaSeleccionada = function () {
            if ($scope.facturaAnularSeleccionada === null) {
                console.error('No hay una factura seleccionada para anular.');
                return;
            }
            //$('#listaFacturasAnulables').modal('hide');
            $('#espera').modal({
                backdrop: 'static',
                keyboard: false,
                show: true
            });
            $http.post(urlRest + 'notacredito/anular/' + $scope.nombreEmpleado + '/', $scope.facturaAnularSeleccionada)
                .then(function (response) {
                    if (response.data) {
                        var datosNotaCredito = response.data;
                        if (datosNotaCredito.codigo === '0') {
                            //consulta las transacciones de caja para la factura y agrega registros opuestos equivalentes para anularlos
                            $http.post(urlRest + 'caja/consultartransacciones/', $scope.facturaAnularSeleccionada)
                                .then(function (response) {
                                    if (response.data) {
                                        var transaccionesResponse = response.data;
                                        var transacciones = [];
                                        for (var i = 0; i < transaccionesResponse.length; i++) {
                                            var transaccion = {
                                                usuario: $scope.nombreEmpleado,
                                                tipo: transaccionesResponse[i].tipo,
                                                valor: transaccionesResponse[i].valor,
                                                justificacion: $scope.facturaAnularSeleccionada.prefijoFactura + $scope.facturaAnularSeleccionada.numeroFactura.substring(2),
                                                anulacion: true
                                            };
                                            transacciones.push(transaccion);
                                        }
                                        $http.post(urlRest + 'caja/transacciones/', transacciones).then();

                                        //consulta los datos de la la anulacion
                                        //y envia a imprimir el comprobante 
                                        $http.get(urlRest + 'factura/consulta/anulacion/' + $scope.facturaAnularSeleccionada.numeroFactura + '/' + datosNotaCredito.nroNotaCredito +
                                                '/' + $scope.nombreCaja + '/' + $scope.nombreEmpleado)
                                            .then(function (response) {
                                                if (response.data) {
                                                    response.data.docType = 'VOID';
                                                    $http.post('http://' + $scope.ipCaja + ':8008/void/', response.data);
                                                } else {
                                                    //TODO: mostrar mensaje de error
                                                }
                                            });

                                        $scope.facturaAnularSeleccionada = null;
                                        $scope.ocultarPanelEspera();
                                    } else {
                                        //TODO: mostrar mensaje de error
                                    }
                                });
                        } else {
                            console.error('Ocurrio un error al ejecutar el proceso de anulacion. ' + datosNotaCredito.mensaje);
                        }
                    } else {
                        console.error('No se pudo anular la factura');
                    }
                });
        };

        $scope.listarVentasSuspendidas = function () {
            $scope.ventasPendientes = [];
            $http.get(urlRest + 'ventapos/pendientes/' + $scope.idTurnoCaja)
                .then(function (response) {
                    if (response.data) {
                        $scope.ventasPendientes = response.data;
                        $('#ventasPendientes').modal('show');
                    } else {
                        console.error('No se encontraron ventas pendientes');
                    }
                });
        };

        $scope.cargarVentaPendiente = function (venta) {
            //consultar productos venta
            $http.get(urlRest + 'ventapos/pendientes/productos/' + venta.idVentaPOS)
                .then(function (response) {
                    if (response.data) {
                        $scope.productos = response.data;
                        validarSaldoProductos(false);
                        if ($scope.productos.length > 0) {
                            $scope.modoCarrito = 'producto';
                        }
                        //consultar cliente venta
                        $scope.nitCliente = venta.nit;
                        $scope.consultarCliente();
                        //eliminar venta pendiente
                        $scope.eliminarVentaPendiente(venta.idVentaPOS);
                        $('#ventasPendientes').modal('hide');
                        $scope.ventasPendientes = [];
                        $scope.calcularTotalCompra();
                    } else {
                        console.error('No se encontraron productos pendientes');
                    }
                });
        };

        $scope.eliminarVentaPendiente = function (idVenta) {
            $http.get(urlRest + 'ventapos/pendientes/eliminar/' + idVenta);
        };

        $scope.mostrarConfirmacionCancelar = function () {
            $('#cancelarVenta').modal('show');
        };

        $scope.cancelarVenta = function () {
            //productos
            $scope.productos = [];
            $scope.productoEliminar = null;
            //cliente
            $scope.cliente = null;
            //pagos
            $scope.saldoFavorCliente = 0;
            $scope.saldoFavorClienteUtilizado = 0;
            $scope.saldoFavorClienteExcedido = false;
            $scope.pagoTarjetaSeleccionado = 0;
            $scope.pagosTarjeta = [];
            $scope.inicializarTotalesPagos();
            $scope.medioSeleccionado = 0;
            $scope.valorEfectivo = null;
            $scope.valorTarjeta = null;
            $scope.tipoTarjetaSeleccionado = null;
            $scope.tarjeta = null;
            $scope.voucher = null;
            $scope.cambio = null;
            $scope.calcularTotalCompra();
            //ventas
            $scope.modoCarrito = null;
            $scope.ventasPendientes = null;
            $scope.nitCliente = null;
            $scope.estadoPedido = null;
            $scope.estadoPedidoSeleccionado = 'seleccione el estado...';
            $scope.comentariosFactura = '';
            //empaque
            $scope.tiposEmpaque = [];
            //asesores
            $scope.empleadosSeleccionados = [];
            //anulaciones
            $scope.facturaAnularSeleccionada = null;
            $scope.facturasAnulables = [];
            //bonos
            $scope.valorBono = 0;
            $scope.cantidadBonos = 1;
            //regalos
            $scope.regaloSeleccionado = null;
            $scope.nombreRegalo = null;
            $scope.regalos = [];
            $scope.cantidadRegalo = 0;
            $scope.mensajeErrorRegalo = null;
            $scope.mensajeConfirmacionRegalo = null;

            $('#cancelarVenta').modal('hide');
        };

        $scope.suspenderVenta = function () {
            var productos = [];
            for (var i = 0; i < $scope.productos.length; i++) {
                var producto = $scope.productos[i];
                var prod = {
                    referencia: producto.itemCode,
                    descripcion: producto.itemName,
                    refProveedor: producto.providerCode,
                    cantidad: producto.cantidad,
                    precio: producto.price,
                    descuento: producto.discountPercent,
                    impuesto: producto.taxRate
                };
                productos.push(prod);
            }
            var venta = {
                estado: "PE",
                nit: $scope.cliente ? $scope.cliente.cardCode : null,
                almacen: $scope.almacen,
                usuario: $scope.nombreEmpleado,
                productos: productos,
                idTurnoCaja: $scope.idTurnoCaja
            };

            $http.post(urlRest + 'ventapos/guardar/', venta).then(
                function (response) {
                    $scope.cancelarVenta();
                },
                function (response) {
                    console.log('finalizo con error');
                }
            );
        };

        $scope.mostrarConfirmacionVenta = function () {
            $scope.cargarEmpleados();
            $('#confirmacionPago').modal('show');
        };

        $scope.generarFactura = function () {
            if ($scope.estadoPedido === null) {
                console.warn('no selecciono un estado de pedido, por lo que el pedido sera configurado como entrega inmediata');
            }
            if ($scope.idTurnoCaja === null) {
                console.log('No se tiene un ID de sesion POS configurado. Cierre sesión y vuelva a intentarlo.');
                $scope.nfMensajeError = 'No se tiene un ID de sesion POS configurado. Cierre sesión y vuelva a intentarlo.';
                $scope.nfCodigoError = -1;
                return;
            }
            var productos = [];
            for (var i = 0; i < $scope.productos.length; i++) {
                var producto = $scope.productos[i];
                var ubicaciones = [];
                for (var j = 0; j < $scope.ubicacionesProductos.length; j++) {
                    var ubicacionProducto = $scope.ubicacionesProductos[j];
                    if (ubicacionProducto.referencia === producto.itemCode) {
                        if (ubicacionProducto.exhibicion.seleccionado > 0) {
                            var ubicacion = {
                                binAbsEntry: ubicacionProducto.exhibicion.binAbs,
                                cantidad: ubicacionProducto.exhibicion.seleccionado,
                                almacen: ubicacionProducto.exhibicion.whsCode
                                //almacen: $scope.almacen
                            };
                            ubicaciones.push(ubicacion);
                        }
                        if (ubicacionProducto.bodega.seleccionado > 0) {
                            for (var k = 0; k < ubicacionProducto.bodega.ubicacionesBodega.length; k++) {
                                var ubicacion = {
                                    binAbsEntry: ubicacionProducto.bodega.ubicacionesBodega[k].binAbs,
                                    cantidad: ubicacionProducto.bodega.ubicacionesBodega[k].seleccionado,
                                    almacen: ubicacionProducto.bodega.ubicacionesBodega[k].whsCode
                                };
                                ubicaciones.push(ubicacion);
                            }
                        }
                        break;
                    }
                }

                var prod = {
                    referencia: producto.itemCode,
                    descripcion: producto.itemName,
                    refProveedor: producto.providerCode,
                    cantidad: producto.cantidad,
                    precio: producto.price,
                    descuento: producto.discountPercent,
                    ubicaciones: ubicaciones
                };
                productos.push(prod);
            }

            var pagos = [];
            for (var i = 0; i < $scope.pagosTarjeta.length; i++) {
                var pagoTarjeta = $scope.pagosTarjeta[i];
                if (pagoTarjeta !== null && pagoTarjeta.tipo !== null &&
                    pagoTarjeta.valor !== null && pagoTarjeta.tarjeta !== null &&
                    pagoTarjeta.voucher !== null) {
                    var pago = {
                        franquicia: pagoTarjeta.tipo,
                        valor: pagoTarjeta.valor,
                        digitos: pagoTarjeta.tarjeta,
                        voucher: pagoTarjeta.voucher
                    };
                    pagos.push(pago);
                }
            }

            var venta = {
                idVentaPOS: $scope.idTurnoCaja,
                estado: "PE",
                estadoPedido: $scope.estadoPedido,
                asesores: $scope.empleadosSeleccionados,
                //codVendedor: $scope.codAsesor === null ? '98' : $scope.codAsesor,
                comentarios: $scope.comentariosFactura,
                nit: $scope.cliente ? $scope.cliente.cardCode : null,
                almacen: $scope.almacen,
                usuario: $scope.nombreEmpleado,
                productos: productos,
                totalVenta: $scope.totalCompra,
                efectivo: $scope.valorEfectivo === null ? 0 : $scope.valorEfectivo - $scope.cambio,
                cuentaEfectivo: $scope.cuentaEfectivo,
                certificadosRegalo: $scope.regalos,
                pagosTarjeta: pagos
            };

            //oculta panel de pago y muestra modal de confirmacion de venta y empaque
            $scope.resultadoFactura = null;
            $('#confirmacionPago').modal('hide');
            $('#espera').modal({
                backdrop: 'static',
                keyboard: false,
                show: true
            });
            $http.post(urlRest + 'ventapos/facturar/', venta).then(
                function (response) {
                    console.log(response.data);
                    if (response.data.codigo === "0") {
                        $('#espera').modal('hide');
                        $scope.resultadoFactura = response.data;
                        $scope.cargarTiposEmpaque();
                        $('#confirmacionFactura').modal({
                            backdrop: 'static',
                            keyboard: false,
                            show: true
                        });
                        if ($scope.resultadoFactura.numeroFactura !== '' && $scope.resultadoFactura.resolucion !== null) {
                            $scope.regalos = $scope.resultadoFactura.certificados;
                            //invoca servicio para imprimir recibo
                            var itemsRecibo = [];
                            var detalleIVA = [];
                            for (var i = 0; i < $scope.productos.length; i++) {
                                var producto = $scope.productos[i];
                                var item = {
                                    itemCode: producto.itemCode,
                                    itemName: producto.itemName,
                                    quantity: producto.cantidad,
                                    price: (producto.price) - ((producto.price / 100) * producto.discountPercent)
                                };
                                itemsRecibo.push(item);

                                var impuestoExiste = false;
                                for (var j = 0; j < detalleIVA.length; j++) {
                                    if (detalleIVA[j].vatName === producto.taxName) {
                                        //acumula el valor base del impuesto
                                        detalleIVA[j].baseValue = detalleIVA[j].baseValue + (item.price / (1 + (producto.taxRate / 100))) * producto.cantidad;
                                        detalleIVA[j].value = detalleIVA[j].value + ((item.price * producto.cantidad) - ((item.price * producto.cantidad) / (1 + (producto.taxRate / 100))));
                                        impuestoExiste = true;
                                        break;
                                    }
                                }
                                if (!impuestoExiste) {
                                    //agrega el nuevo registro de impuesto
                                    var iva = {
                                        vatName: producto.taxName,
                                        value: (item.price * producto.cantidad) - ((item.price * producto.cantidad) / (1 + (producto.taxRate / 100))),
                                        baseValue: (item.price * producto.cantidad) / (1 + (producto.taxRate / 100))
                                    };
                                    detalleIVA.push(iva);
                                }
                            }

                            var operaciones = construirPagosParaImpresion($scope.resultadoFactura.numeroFactura, 'F');
                            $http.post(urlRest + 'caja/transacciones/', operaciones.transacciones).then(
                                function (response) {
                                    $http.post(urlRest + 'caja/saldo', $scope.nombreEmpleado).then(
                                        function (response) {
                                            if (response.data > 3000000) {
                                                //TODO: enviar sms alerta monto caja alto
                                            }
                                        }
                                    );
                                }
                            );
                            var invoiceData = {
                                docType: 'ORIGINAL',
                                invoiceNumber: $scope.resultadoFactura.numeroFactura,
                                cashierName: $scope.nombreEmpleado,
                                cashRegister: $scope.nombreCaja,
                                orderStatus: $scope.estadoPedido,
                                invoiceResolution: {
                                    number: $scope.resultadoFactura.resolucion.numero,
                                    date: $scope.resultadoFactura.resolucion.fecha,
                                    prefix: $scope.resultadoFactura.resolucion.prefijo,
                                    from: $scope.resultadoFactura.resolucion.desde,
                                    to: $scope.resultadoFactura.resolucion.hasta
                                },
                                customer: {
                                    id: venta.nit.replace('CL', ''),
                                    name: $scope.cliente.cardName
                                },
                                change: $scope.cambio,
                                footerText: "Aviso de privacidad: Los datos personales suministrados en el presente documento seran tratados de manera confidencial, solo para fines comerciales y como base de soporte para la presente negociacion. Igualmente tendran como finalidad informar sobre nuevos productos, promociones y servicios , vinculados o relacionados con nuestra marca Matisses, Distribuciones Baru S.A., propietaria de la marca o en colaboracion con terceros. Cualquier consulta que requiera sobre sus datos personales, puede realizarla por medio de nuestros canales: Pagina web www.matisses.co, correo electronico servicioalcliente@matisses.co, o comunicandose a la linea gratuita nacional matisses 01 8000 41 00 44 - ( 034)444-04-34 Opc 1, en el horario de atencion al cliente de Lunes a viernes de 9:30 am a 12:30 pm y de 1:30 pm a 5:00 pm. Las devoluciones solo seran aceptadas si el producto se entrega en su empaque original y tanto el empaque como el producto se encuentran en perfecto estado. Para procesos de garantia, no se aceptaran reclamaciones donde se evidencie el mal uso del producto o el incorrecto seguimiento del manual de instrucciones del mismo.",
                                items: itemsRecibo,
                                vatDetail: detalleIVA,
                                payments: operaciones.pagos,
                                binAllocations: $scope.resultadoFactura.ubicaciones,
                                giftCertificates: $scope.regalos
                            };
                            //Invoca el servicio de impresion del equipo que genero la factura
                            $http.post('http://' + $scope.ipCaja + ':8008/print/', invoiceData).then(
                                function (response) {
                                    console.log(response.data);
                                },
                                function (response) {
                                    console.log(response);
                                    console.log('finalizo con error');
                                }
                            );
                        }
                        $scope.cancelarVenta();
                    } else {
                        console.log(response.data.mensaje);
                        $scope.nfMensajeError = response.data.mensaje;
                        $scope.nfCodigoError = response.data.codigo;
                        $('#confirmacionPago').modal('show');
                        $('#espera').modal('hide');
                    }
                },
                function (response) {
                    console.log('finalizo con error');
                }
            );
        };

        $scope.mostrarPanelDevoluciones = function () {
            $('#devoluciones').modal('show');
        };

        ///////////////////////////////////////////////////////////////////////////////
        ////////////////// Tarjeta regalo /////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////
        $scope.errorTarjetaRegalo = false;
        $scope.valorBono = null;
        $scope.cantidadBonos = null;

        $scope.mostrarPanelTarjetaRegalo = function () {
            if ($scope.modoCarrito === 'bono' && $scope.productos.length === 1) {
                $scope.valorBono = $scope.productos[0].price;
                $scope.cantidadBonos = $scope.productos[0].cantidad;
            }
            $('#tarjetaRegalo').modal('show');
        };

        $scope.agregarTarjetaRegalo = function () {
            if (($scope.modoCarrito === null || $scope.modoCarrito === 'bono') && $scope.cantidadBonos > 0 && $scope.valorBono > 0) {
                $scope.errorTarjetaRegalo = false;
                $scope.modoCarrito = 'bono';
                var producto = {
                    itemCode: 'BONO',
                    itemName: 'TARJETA DE REGALO MATISSES (' + $scope.cantidadBonos + ' TARJETAS)',
                    price: $scope.valorBono,
                    providerCode: '000000',
                    cantidad: 1,
                    discountPercent: 0,
                    taxRate: 0
                };
                if ($scope.modoCarrito === 'bono') {
                    //si el carrito ya contiene un bono, lo elimina para agregar los nuevos datos
                    $scope.productos.splice(0, 1);
                }
                $scope.productos.unshift(producto);
                $scope.valorBono = null;
                $scope.cantidadBonos = null;
                $scope.calcularTotalCompra();
                $('#tarjetaRegalo').modal('hide');
            } else {
                $scope.errorTarjetaRegalo = true;
            }
        };

        ///////////////////////////////////////////////////////////////////////////////
        ////////////////// Productos //////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////
        $scope.totalCompra = 0;
        $scope.modoTablaProductos = 'tabla';
        $scope.productos = [];
        $scope.productoEliminar = null;
        $scope.productoUbicaciones = null;
        $scope.productoSeleccionado = 0;
        $scope.ubicacionesProductos = [
            /* ESTE BLOQUE DE CODIGO SE MANTIENE COMO REFERENCIA
             *             {
             *                 referencia: null,
             *                 exhibicion: {
             *                     disponible: 0,
             *                     seleccionado: 0
             *                 },
             *                 bodega: {
             *                     disponible: 0,
             *                     seleccionado: 0,
             *                     ubicacionesBodega: [
             *                     {
             *                         whsCode: '',
             *                         binCode: '',
             *                         binAbs: 0,
             *                         disponible: 0,
             *                         seleccionado: 0
             *                     }
             *                     ]
             *                 }
             *             }
             */
        ];

        $scope.cambiarModoVisualizacion = function (modo) {
            $scope.modoTablaProductos = modo;
            $('#txtBusqueda').focus();
        };

        $scope.mostrarSiguienteProducto = function () {
            if ($scope.productoSeleccionado < $scope.productos.length - 1) {
                $scope.productoSeleccionado++;
                $scope.productoUbicaciones = $scope.productos[$scope.productoSeleccionado];
            }
        };

        $scope.mostrarProductoAnterior = function () {
            if ($scope.productoSeleccionado > 0) {
                $scope.productoSeleccionado--;
                $scope.productoUbicaciones = $scope.productos[$scope.productoSeleccionado];
            }
        };

        referenciaEstaUbicada = function (referencia) {
            for (var i = 0; i < $scope.ubicacionesProductos.length; i++) {
                if ($scope.ubicacionesProductos[i].referencia === referencia) {
                    return true;
                }
            }
            return false;
        };

        agregarUbicacionReferencia = function (referencia, almacen, binCode, binAbs, cantidad) {
            var i = 0;
            while (i < $scope.ubicacionesProductos.length) {
                if ($scope.ubicacionesProductos[i].referencia === referencia) {
                    break;
                }
                i++;
            }
            if (i < $scope.ubicacionesProductos.length) {
                //la referencia YA ha sido agregada, solo agregar detalle de ubicacion
                var ubicacionProducto = $scope.ubicacionesProductos[i];
                if (binCode.indexOf('COMPL') >= 0) {
                    ubicacionProducto.exhibicion.disponible += cantidad;
                    if (ubicacionProducto.exhibicion.binAbs === 0) {
                        ubicacionProducto.exhibicion.binAbs = binAbs;
                    }
                    ubicacionProducto.exhibicion.whsCode = almacen;
                } else {
                    ubicacionProducto.bodega.disponible += cantidad;
                    ubicacionProducto.bodega.ubicacionesBodega.push({
                        whsCode: almacen,
                        binCode: binCode,
                        binAbs: binAbs,
                        disponible: cantidad,
                        seleccionado: 0
                    });
                }
            } else {
                //la referencia NO ha sido agregada, agregar registro completo
                var ubicacionProducto = {};
                if (binCode.indexOf('COMPL') >= 0) {
                    //exhibicion
                    ubicacionProducto = {
                        referencia: $scope.productoUbicaciones.itemCode,
                        exhibicion: {
                            binAbs: binAbs,
                            whsCode: almacen,
                            disponible: cantidad,
                            seleccionado: 0
                        },
                        bodega: {
                            disponible: 0,
                            seleccionado: 0,
                            ubicacionesBodega: []
                        }
                    };
                } else {
                    //bodega
                    ubicacionProducto = {
                        referencia: $scope.productoUbicaciones.itemCode,
                        exhibicion: {
                            binAbs: 0,
                            disponible: 0,
                            seleccionado: 0
                        },
                        bodega: {
                            disponible: cantidad,
                            seleccionado: 0,
                            ubicacionesBodega: [
                                {
                                    whsCode: almacen,
                                    binCode: binCode,
                                    binAbs: binAbs,
                                    disponible: cantidad,
                                    seleccionado: 0
                                }
                            ]
                        }
                    };
                }
                $scope.ubicacionesProductos.push(ubicacionProducto);
            }
        };

        $scope.validarTipoVenta = function () {
            if ($scope.modoCarrito === 'producto') {
                $scope.mostrarPanelUbicaciones();
            } else {
                var pagosTarjeta = [];
                for (var i = 0; i < $scope.pagosTarjeta.length; i++) {
                    var pagoTarjeta = $scope.pagosTarjeta[i];
                    if (pagoTarjeta !== null && pagoTarjeta.tipo !== null &&
                        pagoTarjeta.valor !== null && pagoTarjeta.tarjeta !== null &&
                        pagoTarjeta.voucher !== null) {
                        var pago = {
                            franquicia: pagoTarjeta.tipo,
                            valor: pagoTarjeta.valor,
                            digitos: pagoTarjeta.tarjeta,
                            voucher: pagoTarjeta.voucher
                        };
                        pagosTarjeta.push(pago);
                    }
                }
                var pagosCuenta = [{
                    accountCode: '28050503',
                    cardCode: $scope.nitCliente,
                    sumPaid: $scope.totalCompra
                    }];
                var venta = {
                    usuario: $scope.nombreEmpleado,
                    almacen: $scope.almacen,
                    pagosTarjeta: pagosTarjeta,
                    efectivo: $scope.valorEfectivo === null ? 0 : $scope.valorEfectivo - $scope.cambio,
                    cuentaEfectivo: $scope.cuentaEfectivo,
                    nombreCliente: $scope.cliente ? $scope.cliente.cardName : null,
                    nit: $scope.cliente ? $scope.cliente.cardCode : null,
                    totalVenta: $scope.totalCompra,
                    pagosCuenta: pagosCuenta,
                    estacion: $scope.nombreCaja,
                    productos: [{
                        descripcion: $scope.productos[0].itemName
                    }]
                };
                $('#espera').modal({
                    backdrop: 'static',
                    keyboard: false,
                    show: true
                });
                $http.post(urlRest + 'ventapos/venderTarjetaRegalo/', venta).then(
                    function (response) {
                        if (response.data) {
                            if (response.data.codigo === '0') {
                                //imprime tirilla
                                var operaciones = construirPagosParaImpresion(response.data.mensaje, 'R');
                                $http.post(urlRest + 'caja/transacciones/', operaciones.transacciones).then();
                                var receiptData = {
                                    change: $scope.cambio,
                                    cashReceiptNumber: response.data.mensaje,
                                    printerName: null,
                                    cashierName: $scope.nombreEmpleado,
                                    cashRegister: $scope.nombreCaja,
                                    customer: {
                                        id: venta.nit.replace('CL', ''),
                                        name: $scope.cliente.cardName
                                    },
                                    payments: operaciones.pagos
                                };
                                $http.post('http://' + $scope.ipCaja + ':8008/printReciboCaja/', receiptData).then(
                                    function (response) {
                                        console.log(response.data);
                                    },
                                    function (response) {
                                        console.log(response);
                                        console.log('finalizo con error');
                                    }
                                );
                            } else {
                                //TODO: informar error
                            }
                            $('#espera').modal('hide');
                        } else {
                            console.error('Ocurrio un error al generar el recibo de caja para tarjetas de regalo. ');
                        }
                        $scope.cancelarVenta();
                        $scope.consultarDatosSesion();
                    }
                );
            }
        };

        $scope.mostrarPanelUbicaciones = function () {
            //selecciona el primer producto para visualizarlo
            validarSaldoProductos(true);
        };

        $scope.finalizarSeleccionProductos = function () {
            var cantidadesSeleccionadas = true;
            for (var i = 0; i < $scope.ubicacionesProductos.length; i++) {
                if ($scope.ubicacionesProductos[i].bodega.seleccionado + $scope.ubicacionesProductos[i].exhibicion.seleccionado !== $scope.productos[i].cantidad) {
                    cantidadesSeleccionadas = false;
                    console.warn('no se han seleccionado las ubicaciones para el producto ' + $scope.productos[i].itemCode);
                }
            }
            if (cantidadesSeleccionadas) {
                $('#ubicaciones').modal('hide');
                $scope.mostrarConfirmacionVenta();
            }
        };

        $scope.agregarCantidadUbicacion = function (tipoAlmacen) {
            if (tipoAlmacen === 'b') {
                console.log('agregando cantidad de productos de bodega');
                if ($scope.ubicacionesProductos[$scope.productoSeleccionado].bodega.seleccionado === $scope.ubicacionesProductos[$scope.productoSeleccionado].bodega.disponible) {
                    console.error('no se pueden seleccionar mas productos de bodega porque se excede la cantidad disponible');
                    return;
                } else if ($scope.productos[$scope.productoSeleccionado].cantidad === $scope.ubicacionesProductos[$scope.productoSeleccionado].bodega.seleccionado +
                    $scope.ubicacionesProductos[$scope.productoSeleccionado].exhibicion.seleccionado) {
                    console.error('no se pueden seleccionar mas productos de los necesarios');
                    return;
                } else {
                    $scope.ubicacionesProductos[$scope.productoSeleccionado].bodega.seleccionado++;
                    for (var i = 0; i < $scope.ubicacionesProductos[$scope.productoSeleccionado].bodega.ubicacionesBodega.length; i++) {
                        if ($scope.ubicacionesProductos[$scope.productoSeleccionado].bodega.ubicacionesBodega[i].seleccionado < $scope.ubicacionesProductos[$scope.productoSeleccionado].bodega.ubicacionesBodega[i].disponible) {
                            console.log('incrementando cantidad seleccionada de la ubicacion ' + $scope.ubicacionesProductos[$scope.productoSeleccionado].bodega.ubicacionesBodega[i].binCode);
                            $scope.ubicacionesProductos[$scope.productoSeleccionado].bodega.ubicacionesBodega[i].seleccionado++;
                            break;
                        }
                    }
                }
            } else {
                console.log('agregando cantidad de productos de exhibicion');
                if ($scope.ubicacionesProductos[$scope.productoSeleccionado].exhibicion.seleccionado === $scope.ubicacionesProductos[$scope.productoSeleccionado].exhibicion.disponible) {
                    console.error('no se pueden seleccionar mas productos de exhibicion porque se excede la cantidad disponible');
                    return;
                } else if ($scope.productos[$scope.productoSeleccionado].cantidad === $scope.ubicacionesProductos[$scope.productoSeleccionado].bodega.seleccionado +
                    $scope.ubicacionesProductos[$scope.productoSeleccionado].exhibicion.seleccionado) {
                    console.error('no se pueden seleccionar mas productos de los necesarios');
                    return;
                } else {
                    $scope.ubicacionesProductos[$scope.productoSeleccionado].exhibicion.seleccionado++;
                }
            }
        };

        $scope.quitarCantidadUbicacion = function (tipoAlmacen) {
            if (tipoAlmacen === 'b') {
                console.log('quitando cantidad de productos de bodega');
                if ($scope.ubicacionesProductos[$scope.productoSeleccionado].bodega.seleccionado === 0) {
                    console.error('no se pueden quitar mas productos de bodega');
                    return;
                } else {
                    $scope.ubicacionesProductos[$scope.productoSeleccionado].bodega.seleccionado--;
                    for (var i = 0; i < $scope.ubicacionesProductos[$scope.productoSeleccionado].bodega.ubicacionesBodega.length; i++) {
                        if ($scope.ubicacionesProductos[$scope.productoSeleccionado].bodega.ubicacionesBodega[i].seleccionado > 0) {
                            console.log('quitando cantidad seleccionada de la ubicacion ' + $scope.ubicacionesProductos[$scope.productoSeleccionado].bodega.ubicacionesBodega[i].binCode);
                            $scope.ubicacionesProductos[$scope.productoSeleccionado].bodega.ubicacionesBodega[i].seleccionado--;
                            break;
                        }
                    }
                }
            } else {
                console.log('quitando cantidad de productos de exhibicion');
                if ($scope.ubicacionesProductos[$scope.productoSeleccionado].exhibicion.seleccionado === 0) {
                    console.error('no se pueden quitar mas productos de exhibicion');
                    return;
                } else {
                    $scope.ubicacionesProductos[$scope.productoSeleccionado].exhibicion.seleccionado--;
                }
            }
        };

        procesarResultadoBusquedaItem = function (response, cantidad) {
            response.data.lastModified = new Date().getTime();
            var pos = -1;
            for (var i = 0; i < $scope.productos.length; i++) {
                var pr = $scope.productos[i];
                if (pr.itemCode === response.data.itemCode) {
                    pos = i;
                    break;
                }
            }
            if (pos >= 0) {
                if (response.data.availableQuantity > $scope.productos[pos].cantidad) {
                    $scope.productos[pos].cantidad++;
                    $scope.productos[pos].lastModified = new Date().getTime();
                } else {
                    console.error('Se estan agregando mas productos de los que hay disponibles (' + response.data.availableQuantity + ')');
                    $('#inventarioInsuficiente').modal('show');
                }
            } else {
                if (typeof cantidad != 'undefined') {
                    if (response.data.availableQuantity >= cantidad) {
                        response.data.cantidad = cantidad;
                    } else {
                        console.error('No hay suficientes unidades disponibles de la referencia ' + response.data.itemCode +
                            ' (disp=' + response.data.availableQuantity + ', req=' + cantidad + ')');
                    }
                } else {
                    response.data.cantidad = 1;
                }

                //consultar descuentos para el articulo
                $http.get(urlRest + 'consultaproductos/descuento/PO/' + $scope.textoBusqueda).then(
                    function (res) {
                        if (res.data) {
                            response.data.discountPercent = res.data;
                        }
                        $scope.productos.unshift(response.data);
                        $scope.calcularTotalCompra();
                        $scope.textoBusqueda = "";
                        if ($scope.productos.length > 0) {
                            $scope.modoCarrito = 'producto';
                        }
                    },
                    function (res) {
                        $scope.productos.unshift(response.data);
                        $scope.calcularTotalCompra();
                    });
            }
            $scope.textoBusqueda = "";
            if ($scope.productos.length > 0) {
                $scope.modoCarrito = 'producto';
            }
        };

        $scope.buscarYAgregar = function () {
            $http.get(urlRest + 'iteminventario/consulta/' + $scope.textoBusqueda + '/' + $scope.almacen)
                .then(function (response) {
                    if (response.data) {
                        procesarResultadoBusquedaItem(response);
                        $scope.productos.sort(compararItems)
                    } else {
                        console.error('El producto buscado no existe o no tiene saldo disponible');
                        $('#inventarioInsuficiente').modal('show');
                    }
                    $scope.calcularTotalCompra();
                });
        };

        $scope.calcularTotalProductos = function () {
            $scope.totalProductos = 0;
            for (var i = 0; i < $scope.productos.length; i++) {
                var product = $scope.productos[i];
                $scope.totalProductos += product.cantidad;
            }
            return $scope.totalProductos;
        };

        $scope.calcularTotalCompra = function () {
            $scope.totalCompra = 0;
            $scope.totalIVA = 0;
            $scope.totalBase = 0;
            for (var i = 0; i < $scope.productos.length; i++) {
                var product = $scope.productos[i];
                var totalLinea = (product.price * product.cantidad) - ((product.price * product.cantidad / 100) * product.discountPercent);
                var totalIvaLinea = (parseInt(product.taxRate) * parseInt(totalLinea)) / (100 + parseInt(product.taxRate));
                $scope.totalIVA += totalIvaLinea;
                $scope.totalCompra += totalLinea;
            }
            $scope.totalBase += $scope.totalCompra - $scope.totalIVA;
            $scope.calcularPagos();
            return $scope.totalCompra;
        };

        $scope.mostrarConfirmacionBorrado = function (ref) {
            $scope.productoEliminar = ref;
            $('#borrarProducto').modal('show');
        };

        $scope.borrarProductoCarrito = function (cantidad) {
            for (var i = 0; i < $scope.productos.length; i++) {
                var prod = $scope.productos[i];
                if (prod.itemCode === $scope.productoEliminar.itemCode) {
                    if (prod.cantidad > cantidad) {
                        prod.cantidad -= cantidad;
                    } else {
                        $scope.productos.splice(i, 1);
                    }
                    $scope.calcularTotalCompra();
                    $('#borrarProducto').modal('hide');
                    if ($scope.productos.length === 0) {
                        $scope.modoCarrito = null;
                    }
                    return;
                }
            }
        };

        construirPagosParaImpresion = function (justificacion, tipoDoc) {
            var pagosRecibo = [];
            var transaccionesPorRegistrar = [];
            //Si hay pago en efectivo, lo agrega
            if ($scope.valorEfectivo > 0) {
                var pagoEfectivo = {
                    paymentType: "Efectivo",
                    valuePaid: $scope.valorEfectivo,
                    requiresCashDrawer: true
                };
                pagosRecibo.push(pagoEfectivo);
                //registra la entrada de efectivo para el cuadre de caja
                var operacionEfectivo = {
                    usuario: $scope.nombreEmpleado,
                    tipo: 'pago',
                    valor: $scope.valorEfectivo,
                    justificacion: justificacion,
                    tipoDocumento: tipoDoc
                };
                transaccionesPorRegistrar.push(operacionEfectivo);
                if ($scope.cambio > 0) {
                    //registra la salida de efectivo (por entrega de cambio) para el cuadre de caja
                    var operacionCambio = {
                        usuario: $scope.nombreEmpleado,
                        tipo: 'cambio',
                        valor: $scope.cambio,
                        justificacion: justificacion,
                        tipoDocumento: tipoDoc
                    };
                    transaccionesPorRegistrar.push(operacionCambio);
                }
            }
            //Si hay pago con saldo a favor, lo agrega
            if ($scope.saldoFavorClienteUtilizado > 0) {
                var pagoSaldo = {
                    paymentType: "Otro",
                    valuePaid: $scope.saldoFavorClienteUtilizado,
                    requiresCashDrawer: false
                };
                pagosRecibo.push(pagoSaldo);
                //registra operacion de caja para pago con saldo a favor
                var operacionSaldo = {
                    usuario: $scope.nombreEmpleado,
                    tipo: 'otro',
                    valor: $scope.saldoFavorClienteUtilizado,
                    justificacion: justificacion,
                    tipoDocumento: tipoDoc
                };
                transaccionesPorRegistrar.push(operacionSaldo);
            }
            //Agrega los pagos realizados con tarjeta
            for (var i = 0; i < $scope.pagosTarjeta.length; i++) {
                var pagoTarjeta = $scope.pagosTarjeta[i];
                if (pagoTarjeta !== null && pagoTarjeta.tipo !== null &&
                    pagoTarjeta.valor !== null && pagoTarjeta.tarjeta !== null &&
                    pagoTarjeta.voucher !== null) {
                    var pagoRecibo = {
                        paymentType: pagoTarjeta.franquicia,
                        valuePaid: pagoTarjeta.valor,
                        requiresCashDrawer: false
                    };
                    pagosRecibo.push(pagoRecibo);
                    //agrega el registro de pago con tarjeta
                    var operacionTarjeta = {
                        usuario: $scope.nombreEmpleado,
                        tipo: 'tarjeta',
                        valor: pagoTarjeta.valor,
                        justificacion: justificacion,
                        tipoDocumento: tipoDoc
                    };
                    transaccionesPorRegistrar.push(operacionTarjeta);
                }
            }
            var operaciones = {
                pagos: pagosRecibo,
                transacciones: transaccionesPorRegistrar
            };
            return operaciones;
        };
        ///////////////////////////////////////////////////////////////////////////////
        ////////////////// Pagos //////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////
        $scope.edicionPagoTarjeta = false;
        $scope.saldoFavorCliente = 0;
        $scope.saldoFavorClienteUtilizado = 0;
        $scope.saldoFavorClienteExcedido = false;
        $scope.baseIVAParcial = 0;
        $scope.valorIVAParcial = 0;
        $scope.codigoRespuestaDatafono = null;
        $scope.mensajeRespuestaDatafono = null;
        $scope.totalCompra = 0;
        $scope.totalPagado = 0;
        $scope.pagoPendiente = 0;
        $scope.ejecutandoAnulacion = false;

        $scope.mediosPago = [
            {
                codigo: 1,
                nombre: 'Efectivo',
                valor: 0,
                activo: true
            },
            {
                codigo: 2,
                nombre: 'Cheque',
                valor: 0,
                activo: false
            },
            {
                codigo: 3,
                nombre: 'Tarjeta',
                valor: 0,
                activo: true
            },
            {
                codigo: 4,
                nombre: 'Bono',
                valor: 0,
                activo: false
            },
            {
                codigo: 5,
                nombre: 'Cruce saldo',
                valor: 0,
                activo: true
            }
        ];

        $scope.consultarSaldoCliente = function () {
            $http.get(urlRest + 'sociodenegocios/saldo/' + $scope.cliente.cardCode)
                .then(function (response) {
                    $scope.saldoFavorClienteUtilizado = 0;
                    if (response.data < 0) {
                        $scope.saldoFavorCliente = 0;
                    } else {
                        $scope.saldoFavorCliente = response.data;
                    }
                    $('#saldoFavorCliente').modal('show');
                })
                .catch(function (data, status) {});
        };

        $scope.mostrarPanelTarjetas = function () {
            $scope.edicionPagoTarjeta = false;
            $('#pagoTarjeta').modal('show');
        };

        $scope.seleccionarFranquicia = function (tarjeta) {
            if (!$scope.edicionPagoTarjeta) {
                $scope.franquiciaSeleccionada = tarjeta;
            }
        };

        $scope.enviarDatosDatafono = function () {
            $scope.codigoRespuestaDatafono = null;
            $('#datafono').modal({
                backdrop: 'static',
                keyboard: false,
                show: true
            });
            var transactionData = {
                type: "0",
                transactionTotal: String($scope.npValor),
                vatTotal: $scope.valorIVAParcial.replace(',', ''),
                invoiceNumber: "",
                baseDevTotal: $scope.baseIVAParcial.replace(',', ''),
                otherTaxTotal: "0",
                cashierCode: "0"
            };

            console.log(transactionData);

            $http.post('http://' + $scope.ipCaja + ':8008/sendpayment/', transactionData).then(
                function (response) {
                    //respuesta recibida
                    console.log(response.data);
                    $scope.codigoRespuestaDatafono = response.data.code;
                    if (response.data.code === '00') {
                        //Transaccion aprobada
                        var franchise = response.data.franchise;
                        var tarjeta = null;
                        for (var i = 0; i < $scope.tiposTarjeta.length; i++) {
                            if (franchise.replace(/ /g, '') === $scope.tiposTarjeta[i].franchiseName) {
                                tarjeta = $scope.tiposTarjeta[i];
                                break;
                            }
                        }
                        if (tarjeta === null) {
                            //TODO: mostrar panel de seleccion de franquicia
                        } else {
                            var porcentaje = $scope.npValor / $scope.totalCompra;
                            var pagoTarjeta = {
                                tipo: tarjeta.creditCardId,
                                franquicia: tarjeta.franchiseName,
                                valor: $scope.npValor,
                                tarjeta: response.data.cardNumber.slice(-4),
                                voucher: response.data.receiptNumber,
                                base: $scope.totalBase * porcentaje,
                                iva: $scope.totalIVA * porcentaje
                            };
                            $scope.pagosTarjeta.push(pagoTarjeta);
                        }

                        //if ($scope.edicionPagoTarjeta) {
                        //    for (var i = 0; i < $scope.pagosTarjeta.length; i++) {
                        //        if ($scope.pagosTarjeta[i].tipo === $scope.franquiciaSeleccionada.creditCardId) {
                        //            $scope.pagosTarjeta[i].valor = $scope.npValor;
                        //            $scope.pagosTarjeta[i].tarjeta = $scope.franquiciaSeleccionada.type === 'debit' ? 'N/A' : $scope.npDigitos;
                        //            $scope.pagosTarjeta[i].voucher = $scope.npVoucher;
                        //            $scope.pagosTarjeta[i].base = $scope.totalBase * porcentaje;
                        //            $scope.pagosTarjeta[i].iva = $scope.totalIVA * porcentaje;
                        //            break;
                        //        }
                        //    }
                        //} else {
                        //}

                        $scope.npDigitos = '';
                        $scope.npVoucher = '';
                        $scope.npValor = null;
                        $scope.npBase = null;
                        $scope.npIVA = null;
                        $scope.npCodigoError = '0';
                        $scope.npMensajeError = '';
                        $scope.franquiciaSeleccionada = null;
                        $scope.sumarPagosTarjeta();
                        $scope.edicionPagoTarjeta = false;
                        $scope.codigoRespuestaDatafono = null;

                        $('#datafono').modal('hide');
                    } else {
                        //response.data.code === '01' || response.data.code === '99')
                        //Transaccion declinada
                        if (response.data.message === null) {
                            $scope.mensajeRespuestaDatafono = 'La transacción fue rechazada';
                        } else {
                            $scope.mensajeRespuestaDatafono = response.data.message;
                        }
                        $scope.npValor = 0;
                        $scope.baseIVAParcial = 0;
                        $scope.valorIVAParcial = 0;
                    }
                },
                function (response) {
                    //error al llamar el servicio
                    console.error(response);
                    $('#datafono').modal('hide');
                }
            );
        };

        $scope.agregarPagoCruce = function () {
            if ($scope.saldoFavorClienteUtilizado > $scope.saldoFavorCliente) {
                $scope.saldoFavorClienteExcedido = true;
            } else if ($scope.saldoFavorClienteUtilizado > $scope.totalCompra) {
                $scope.saldoFavorClienteExcedido = true;
            } else {
                $scope.saldoFavorClienteExcedido = false;
                $('#saldoFavorCliente').modal('hide');
            }
        };

        $scope.guardarPagoTarjeta = function () {
            if ($scope.franquiciaSeleccionada === null || typeof $scope.franquiciaSeleccionada === 'undefined') {
                $scope.npCodigoError = '-1';
                $scope.npMensajeError = 'Debes seleccionar una franquicia';
                return;
            }
            if ($scope.franquiciaSeleccionada.type === 'credit' &&
                ($scope.npDigitos === null || $scope.npDigitos.toString().length < 4 || $scope.npDigitos.toString().length > 5)) {
                $scope.npCodigoError = '-1';
                $scope.npMensajeError = 'Los dígitos de tarjeta ingresados no son válidos';
                return;
            }
            if ($scope.npVoucher === null || $scope.npVoucher <= 0) {
                $scope.npCodigoError = '-1';
                $scope.npMensajeError = 'El número de voucher ingresado no es válido';
                return;
            }
            if ($scope.npValor === null || $scope.npValor <= 0) {
                $scope.npCodigoError = '-1';
                $scope.npMensajeError = 'El valor pagado no es válido';
                return;
            }

            var porcentaje = $scope.npValor / $scope.totalCompra;
            var pagoTarjeta = {
                tipo: $scope.franquiciaSeleccionada.creditCardId,
                franquicia: $scope.franquiciaSeleccionada.franchiseName,
                valor: $scope.npValor,
                tarjeta: $scope.franquiciaSeleccionada.type === 'debit' ? 'N/A' : $scope.npDigitos,
                voucher: $scope.npVoucher,
                base: $scope.totalBase * porcentaje,
                iva: $scope.totalIVA * porcentaje
            };
            if ($scope.edicionPagoTarjeta) {
                for (var i = 0; i < $scope.pagosTarjeta.length; i++) {
                    if ($scope.pagosTarjeta[i].tipo === $scope.franquiciaSeleccionada.creditCardId) {
                        $scope.pagosTarjeta[i].valor = $scope.npValor;
                        $scope.pagosTarjeta[i].tarjeta = $scope.franquiciaSeleccionada.type === 'debit' ? 'N/A' : $scope.npDigitos;
                        $scope.pagosTarjeta[i].voucher = $scope.npVoucher;

                        $scope.pagosTarjeta[i].base = $scope.totalBase * porcentaje;
                        $scope.pagosTarjeta[i].iva = $scope.totalIVA * porcentaje;
                        break;
                    }
                }
            } else {
                $scope.pagosTarjeta.push(pagoTarjeta);
            }

            $scope.npDigitos = '';
            $scope.npVoucher = '';
            $scope.npValor = null;
            $scope.npBase = null;
            $scope.npIVA = null;
            $scope.npCodigoError = '0';
            $scope.npMensajeError = '';
            $scope.franquiciaSeleccionada = null;
            $scope.sumarPagosTarjeta();
            $scope.edicionPagoTarjeta = false;
            $('#pagoTarjeta').modal('hide');
        };

        $scope.calcularPorcentajeImpuestos = function () {
            var porcentaje = $scope.npValor / $scope.totalCompra;
            $scope.baseIVAParcial = formatNumber($scope.totalBase * porcentaje);
            $scope.valorIVAParcial = formatNumber($scope.totalIVA * porcentaje);
        };

        $scope.cargarPagoPendiente = function () {
            $scope.npValor = $scope.pagoPendiente;
            $scope.calcularPorcentajeImpuestos();
        };

        $scope.cargarPagoPendienteSaldo = function () {
            if ($scope.pagoPendiente <= $scope.saldoFavorCliente) {
                $scope.saldoFavorClienteUtilizado = $scope.pagoPendiente;
            } else {
                $scope.saldoFavorClienteUtilizado = $scope.saldoFavorCliente;
            }
            $scope.guardarValorCruce();
        };

        function formatNumber(number) {
            return Math.max(0, number).toFixed(0).replace(/(?=(?:\d{3})+$)(?!^)/g, ',');
        }

        $scope.eliminarPagoTarjeta = function (pago) {
            var pos = -1;
            //for (var i = 0; i < $scope.pagosTarjeta.length; i++) {
            //    if ($scope.pagosTarjeta[i].tipo === $scope.franquiciaSeleccionada.creditCardId) {
            //        pos = i;
            //        break;
            //    }
            //}
            for (var i = 0; i < $scope.pagosTarjeta.length; i++) {
                if ($scope.pagosTarjeta[i].tipo === pago.tipo && $scope.pagosTarjeta[i].franquicia === pago.franquicia &&
                   $scope.pagosTarjeta[i].valor === pago.valor && $scope.pagosTarjeta[i].voucher === pago.voucher) {
                    pos = i;
                    break;
                }
            }
            $scope.pagosTarjeta.splice(pos, 1);
            $scope.npDigitos = null;
            $scope.npVoucher = null;
            $scope.npValor = null;
            $scope.franquiciaSeleccionada = null;
            $scope.sumarPagosTarjeta();
            $scope.edicionPagoTarjeta = false;
            //$('#pagoTarjeta').modal('hide');
        };

        $scope.inicializarTotalesPagos = function () {
            $scope.mediosPago = [{
                    codigo: 1,
                    nombre: 'Efectivo',
                    valor: 0,
                    activo: true
                }, {
                    codigo: 2,
                    nombre: 'Cheque',
                    valor: 0,
                    activo: false
                }, {
                    codigo: 3,
                    nombre: 'Tarjeta',
                    valor: 0,
                    activo: true
                }, {
                    codigo: 4,
                    nombre: 'Bono',
                    valor: 0,
                    activo: false
                }, {
                    codigo: 5,
                    nombre: 'Cruce saldo',
                    valor: 0,
                    activo: true
                }
            ];
        };

        $scope.pagosTarjeta = [];

        $scope.npDigitos = null;
        $scope.npVoucher = null;
        $scope.npValor = null;
        $scope.tiposTarjeta = [];
        $scope.totalPagado = 0;
        $scope.pagoPendiente = 0;
        $scope.totalIVA = 0;
        $scope.totalBase = 0;
        $scope.cambio = 0;

        $scope.cargarTiposTarjeta = function () {
            $http.get(urlRest + 'tarjetacredito/' + $scope.almacen)
                .then(function (response) {
                    $scope.tiposTarjeta = response.data;
                })
                .catch(function (data, status) {});
        };

        $scope.medioSeleccionado = 0;
        $scope.pagoTarjetaSeleccionado = 0;
        $scope.valorEfectivo = null;
        $scope.valorTarjeta = null;
        $scope.tipoTarjetaSeleccionado = null;
        $scope.tarjeta = null;
        $scope.voucher = null;

        $scope.setMedio = function (tipo) {
            $scope.medioSeleccionado = tipo;
        };

        $scope.sumarPagosTarjeta = function () {
            $scope.mediosPago[2].valor = 0;
            for (var i = 0; i < $scope.pagosTarjeta.length; i++) {
                try {
                    $scope.mediosPago[2].valor += $scope.pagosTarjeta[i].valor;
                } catch (error) {

                }
            }
            $scope.calcularPagos();
            //$scope.totalPagado = $scope.mediosPago[2].valor;
            //$scope.pagoPendiente = $scope.totalCompra - $scope.totalPagado;
            //$scope.calcularCambio();
        };

        $scope.calcularCambio = function () {
            if ($scope.totalCompra < $scope.totalPagado) {
                if ($scope.valorEfectivo > 0) {
                    $scope.cambio = $scope.pagoPendiente * -1;
                    if ($scope.cambio > $scope.valorEfectivo) {
                        $scope.cambio = $scope.valorEfectivo;
                    }
                } else {
                    $scope.cambio = 0;
                }
                $scope.pagoPendiente = 0;
            } else {
                $scope.cambio = 0;
            }
        };

        $scope.calcularPagos = function () {
            if (typeof $scope.totalCompra === 'undefined') {
                $scope.totalCompra = 0;
            }
            $scope.totalPagado = 0;
            for (var pos in $scope.mediosPago) {
                $scope.totalPagado += $scope.mediosPago[pos].valor;
            }
            $scope.pagoPendiente = $scope.totalCompra - $scope.totalPagado;
            $scope.calcularCambio();
        };

        $scope.seleccionarFilaAnularPagoTarjeta = function (index) {
            $scope.pagoTarjetaAnular = $scope.pagosTarjeta[index];
            $('#confirmarAnulacion').modal({
                backdrop: 'static',
                show: true,
                keyboard: true
            });
        };

        $scope.anularPagoTarjeta = function () {
            $scope.ejecutandoAnulacion = true;
            var transaccionDatafono = {
                type: '1',
                receiptNumber: $scope.pagoTarjetaAnular.voucher,
                invoiceNumber: '',
                supervisorPin: '0000',
                cashierCode: '0'
            };
            $http.post('http://' + $scope.ipCaja + ':8008/sendcancellation/', transaccionDatafono).then(
                function (response) {
                    $('#confirmarAnulacion').modal('hide');
                    $scope.ejecutandoAnulacion = false;
                    console.log(response.data);
                    if (response.data.code === '00') {
                        //Eliminar pago de la lista
                        $scope.eliminarPagoTarjeta($scope.pagoTarjetaAnular);
                    } else {
                        //No se pudo procesar la anulacion
                    }
                },
                function (response) {
                    $('#confirmarAnulacion').modal('hide');
                    $scope.ejecutandoAnulacion = false;
                    console.error(response);
                }
            );
        };

        $scope.seleccionarFilaPagoTarjeta = function (index) {
            var pagoTarjeta = $scope.pagosTarjeta[index];
            for (var i = 0; i < $scope.tiposTarjeta.length; i++) {
                if ($scope.tiposTarjeta[i].creditCardId === pagoTarjeta.tipo) {
                    $scope.franquiciaSeleccionada = $scope.tiposTarjeta[i];
                    break;
                }
            }
            $scope.npValor = pagoTarjeta.valor;
            $scope.npVoucher = pagoTarjeta.voucher;
            $scope.npDigitos = pagoTarjeta.tarjeta;
            $scope.edicionPagoTarjeta = true;
            $('#pagoTarjeta').modal('show');
        };

        $scope.guardarValorEfectivo = function () {
            $scope.mediosPago[0].valor = $scope.valorEfectivo;
            $scope.calcularPagos();
        };

        $scope.guardarValorCruce = function () {
            if ($scope.saldoFavorClienteUtilizado < 0) {
                return;
            }
            $scope.mediosPago[4].valor = $scope.saldoFavorClienteUtilizado;
            $scope.calcularPagos();
        };

        ///////////////////////////////////////////////////////////////////////////////
        ////////////////// Clientes ///////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////
        $scope.cliente = null;
        $scope.ncCelular = '';
        $scope.ncCorreo = '';
        $scope.ncDireccion = '';
        $scope.ncPrimerApellido = '';
        $scope.ncNombres = '';
        $scope.ncSegundoApellido = '';
        $scope.ncTelefono = '';
        $scope.ncResultado = '0';
        $scope.ncMensajeError = '';

        $scope.consultarCliente = function () {
            if ($scope.nitCliente === null || $scope.nitCliente === '') {
                return;
            }
            if ($scope.nitCliente.indexOf('CL', this.length - 2) === -1) {
                $scope.nitCliente = $scope.nitCliente + 'CL';
            }
            $http.get(urlRest + 'sociodenegocios/' + $scope.nitCliente)
                .then(function (response) {
                    if (response.data) {
                        $scope.cliente = response.data;
                        if ($scope.cliente.cardType === 'L') {
                            $scope.cargarDepartamentos();
                            $scope.ncNombres = $scope.cliente.firstName;
                            $scope.ncPrimerApellido = $scope.cliente.lastName1;
                            $scope.ncSegundoApellido = $scope.cliente.lastName2;
                            if ($scope.cliente.addresses !== null && $scope.cliente.addresses.length > 0) {
                                var address = $scope.cliente.addresses[0];
                                var departamento = {
                                    codigo: address.stateCode,
                                    nombre: address.stateName
                                };
                                $scope.seleccionarDepartamento(departamento);
                                $scope.municipioSeleccionado = {
                                    codigo: address.cityCode,
                                    nombre: address.cityName
                                };
                                $scope.ncDireccion = address.address;
                                $scope.ncTelefono = address.landLine;
                                $scope.ncCelular = address.cellphone;
                                $scope.ncCorreo = address.email;
                                setTimeout(function () {
                                    $('#nuevoCliente').modal('show');
                                }, 500);
                            } else {
                                $('#nuevoCliente').modal('show');
                            }
                        } else {
                            $scope.nitCliente = "";
                        }
                    } else {
                        $scope.cliente = [];
                        $scope.cargarDepartamentos();
                        $('#nuevoCliente').modal('show');
                    }
                })
                .catch(function (data, status) {
                    console.error('Repos error', status, data);
                });
        };

        $scope.guardarCliente = function () {
            $scope.ncResultado = '0';
            $scope.ncMensajeError = '';
            if (typeof $scope.ncNombres === 'undefined' || $scope.ncNombres === '' || $scope.ncNombres === null) {
                $scope.ncResultado = '-1';
                $scope.ncMensajeError = 'El nombre es obligatorio';
                return;
            }
            if (typeof $scope.ncPrimerApellido === 'undefined' || $scope.ncPrimerApellido === '' || $scope.ncPrimerApellido === null) {
                $scope.ncResultado = '-1';
                $scope.ncMensajeError = 'El primer apellido es obligatorio';
                return;
            }
            if (typeof $scope.departamentoSeleccionado === 'undefined' || $scope.departamentoSeleccionado === null) {
                $scope.ncResultado = '-1';
                $scope.ncMensajeError = 'No ha seleccionado un departamento';
                return;
            }
            if (typeof $scope.municipioSeleccionado === 'undefined' || $scope.municipioSeleccionado === null) {
                $scope.ncResultado = '-1';
                $scope.ncMensajeError = 'No ha seleccionado un municipio';
                return;
            }
            if (typeof $scope.ncDireccion === 'undefined' || $scope.ncDireccion === '' || $scope.ncDireccion === null) {
                $scope.ncResultado = '-1';
                $scope.ncMensajeError = 'Debe ingresar una dirección';
                return;
            }
            if (typeof $scope.ncCorreo === 'undefined' || $scope.ncCorreo === '' || $scope.ncCorreo === null) {
                $scope.ncResultado = '-1';
                $scope.ncMensajeError = 'El correo electrónico es obligatorio';
                return;
            }

            $('#nuevoCliente').modal('hide');
            $('#espera').modal({
                backdrop: 'static',
                keyboard: false,
                show: true
            });

            var cliente = {
                celular: $scope.ncCelular,
                codCiudad: $scope.municipioSeleccionado.codigo,
                codDepartamento: $scope.departamentoSeleccionado.codigo,
                direccion: $scope.ncDireccion,
                email: $scope.ncCorreo,
                nit: $scope.nitCliente,
                ciudad: $scope.municipioSeleccionado.nombre,
                departamento: $scope.departamentoSeleccionado.nombre,
                telefono: $scope.ncTelefono,
                apellido1: $scope.ncPrimerApellido,
                apellido2: $scope.ncSegundoApellido,
                nombres: $scope.ncNombres,
                razonSocial: $scope.ncPrimerApellido + ' ' + $scope.isNull($scope.ncSegundoApellido, '') + ' ' + $scope.ncNombres,
                autorretenedor: 'N',
                nacionalidad: '01',
                tipoExtranjero: '-',
                regimen: 'RC',
                sexo: 3,
                tipoCliente: $scope.cliente.cardType,
                tipoDocumento: '13',
                tipoPersona: '01',
                codAsesor: '98',
                usuario: $scope.nombreEmpleado
            };

            $http.post(urlRest + 'sociodenegocios', cliente).then(
                function (response) {
                    if (response.data && response.data.codigo === '0') {
                        console.log(response);
                        $('#espera').modal('hide');
                        $scope.consultarCliente();
                        $scope.ncNombres = null;
                        $scope.ncPrimerApellido = null;
                        $scope.ncSegundoApellido = null;
                        $scope.departamentoSeleccionado = null;
                        $scope.municipioSeleccionado = null;
                        $scope.ncDireccion = null;
                        $scope.ncTelefono = null;
                        $scope.ncCelular = null;
                        $scope.ncCorreo = null;
                    } else {
                        console.error(response);
                        //mostrar mensaje de error
                        $scope.ncResultado = response.data.codigo;
                        $scope.ncMensajeError = response.data.mensaje;
                        $('#espera').modal('hide');
                        $('#nuevoCliente').modal('show');
                    }
                },
                function (response) {
                    $('#espera').modal('hide');
                    $('#nuevoCliente').modal('show');
                    console.error(response);
                }
            );
        };

        $scope.isNull = function (str, newStr) {
            if (str === null || typeof str === 'undefined') {
                return newStr;
            }
            return str;
        };

        ///////////////////////////////////////////////////////////////////////////////
        ////////////////// Departamentos //////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////

        $scope.departamentos = [];
        $scope.municipios = [];
        $scope.seleccionarDepartamento = function (dpto) {
            $scope.departamentoSeleccionado = dpto;
            $scope.municipioSeleccionado = null;
            $http.get(urlRest + 'municipio/' + dpto.codigo)
                .then(function (response) {
                    if (response.data) {
                        $scope.municipios = response.data;
                    } else {
                        //si no se recibieron datos
                    }
                })
                .catch(function (data, status) {
                    console.error('Repos error', status, data);
                });
        };
        $scope.seleccionarMunicipio = function (mpio) {
            $scope.municipioSeleccionado = mpio;
        };
        $scope.cargarDepartamentos = function () {
            if ($scope.departamentos.length > 0) {
                return;
            }
            $http.get(urlRest + 'departamentosap')
                .then(function (response) {
                    if (response.data) {
                        $scope.departamentos = response.data;
                    } else {
                        //si no se recibieron datos
                    }
                })
                .catch(function (data, status) {
                    console.error('Repos error', status, data);
                });
        };

        ///////////////////////////////////////////////////////////////////////////////
        ////////////////// Autorizacion ///////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////
        $scope.autUsuario = null;
        $scope.autPsswd = null;
        $scope.autMsgError = null;
        $scope.autAccion = null;
        $scope.autObjeto = null;

        $scope.ocultarPanelEspera = function () {
            $('#espera').modal('hide');
            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove();
            $('.modal-backdrop').remove();
        };

        $scope.ocultarPanelAut = function () {
            $('#autorizacion').modal('hide');
            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove();
            $('.modal-backdrop').remove();
        };

        $scope.mostrarPanelAutorizacion = function (nomAccion, nomObjeto, panelOcultar, funcion) {
            if (typeof panelOcultar !== 'undefined') {
                $(panelOcultar).modal('hide');
            }
            $('#autorizacion').modal({
                backdrop: 'static',
                keyboard: false,
                show: true
            });
            $scope.autAccion = nomAccion;
            $scope.autObjeto = nomObjeto;
            $scope.funcionAutorizada = funcion;
        };

        $scope.validarAutorizacion = function () {
            $scope.ocultarPanelAut();
            $('#espera').modal({
                backdrop: 'static',
                keyboard: false,
                show: true
            });
            var permisos = {
                usuario: $scope.autUsuario,
                clave: $scope.autPsswd,
                accion: $scope.autAccion,
                objeto: $scope.autObjeto
            };
            $scope.autUsuario = null;
            $scope.autPsswd = null;
            $http.post(urlRest + 'session/validar', permisos).then(
                function (response) {
                    $scope.ocultarPanelEspera();
                    if (response.data) {
                        //if ($scope.autObjeto === 1034 && $scope.autAccion === 24) {
                        $scope.autMsgError = null;
                        $scope.autAccion = null;
                        $scope.autObjeto = null;
                        if ($scope.funcionAutorizada !== null) {
                            $scope.funcionAutorizada();
                            $scope.funcionAutorizada = null;
                        }
                        console.log('abriendo cajon monedero...');
                        //} else {
                        //    $scope.autMsgError = 'La combinación de accion-objeto no se reconoce en la vista';
                        //    $('#autorizacion').modal({backdrop: 'static', keyboard: false, show: true});
                        //}
                    } else {
                        $scope.autMsgError = 'Autorización fallida';
                        $('#autorizacion').modal({
                            backdrop: 'static',
                            keyboard: false,
                            show: true
                        });
                    }
                },
                function (response) {
                    //error
                    $scope.autMsgError = 'Ocurrió un error al procesar la autorización';
                    $('#autorizacion').modal({
                        backdrop: 'static',
                        keyboard: false,
                        show: true
                    });
                }
            );
        };

        ///////////////////////////////////////////////////////////////////////////////
        ////////////////// Regalos  ///////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////
        $scope.regaloSeleccionado = null;
        $scope.nombreRegalo = null;
        $scope.regalos = [];
        $scope.cantidadRegalo = 0;
        $scope.mensajeErrorRegalo = null;
        $scope.mensajeConfirmacionRegalo = null;

        $scope.obtenerTextoRegaloSeleccionado = function () {
            if ($scope.regaloSeleccionado === null) {
                if ($scope.regalos.length === 0) {
                    return 'Ingrese un nombre...';
                } else {
                    return 'Seleccione...';
                }
            } else {
                return $scope.regaloSeleccionado.giftName;
            }
        };

        $scope.crearRegalo = function () {
            if ($scope.nombreRegalo === null || $scope.nombreRegalo.length === 0) {
                return;
            }
            var existe = false;
            for (var i = 0; i < $scope.regalos.length; i++) {
                if ($scope.regalos[i].giftName === $scope.nombreRegalo) {
                    existe = true;
                    break;
                }
            }
            if (existe) {
                $scope.mensajeErrorRegalo = 'No se pueden crear dos regalos con el mismo nombre. Ya existe un regalo con el nombre ' + $scope.nombreRegalo;
                $scope.mensajeConfirmacionRegalo = null;
                return;
            } else {
                $scope.mensajeErrorRegalo = null;
            }
            var regalo = {
                giftName: $scope.nombreRegalo,
                items: []
            };
            $scope.regalos.push(regalo);
            $scope.nombreRegalo = null;
            $scope.seleccionarRegalo($scope.regalos[$scope.regalos.length - 1]);
        };

        $scope.seleccionarRegalo = function (regalo) {
            $scope.regaloSeleccionado = regalo;
            $scope.cantidadRegalo = $scope.obtenerCantidadItemRegalo(regalo.giftName, $scope.productoUbicaciones.itemCode);
        };

        $scope.agregarArticuloRegalo = function () {
            $scope.mensajeConfirmacionRegalo = null;
            if (!validarCantidadRegalo()) {
                return;
            }
            var i;
            for (i = 0; i < $scope.regaloSeleccionado.items.length; i++) {
                if ($scope.regaloSeleccionado.items[i].itemCode === $scope.productoUbicaciones.itemCode) {
                    break;
                }
            }
            if (i >= 0) {
                //retira el item en la posicion encontrada para volverlo a agregar con la nueva cantidad
                $scope.regaloSeleccionado.items.splice(i, 1);
            }
            var articulo = {
                itemCode: $scope.productoUbicaciones.itemCode,
                quantity: $scope.cantidadRegalo
            };
            $scope.regaloSeleccionado.items.push(articulo);
            for (var i = 0; i < $scope.regalos.length; i++) {
                if ($scope.regalos[i].giftName === $scope.regaloSeleccionado.giftName) {
                    $scope.regalos[i] = $scope.regaloSeleccionado;
                    break;
                }
            }
            $scope.mensajeConfirmacionRegalo = 'Se agregaron ' + $scope.cantidadRegalo + ' unidades de la referencia ' + $scope.productoUbicaciones.itemCode +
                ' al regalo ' + $scope.regaloSeleccionado.giftName;
        };

        $scope.obtenerCantidadItemRegalo = function (nombreRegalo, referencia) {
            for (var i = 0; i < $scope.regalos.length; i++) {
                if ($scope.regalos[i].giftName === nombreRegalo) {
                    for (var j = 0; j < $scope.regalos[i].items.length; j++) {
                        if ($scope.regalos[i].items[j].itemCode === referencia) {
                            return parseInt($scope.regalos[i].items[j].quantity);
                        }
                    }
                }
            }
            return 0;
        };

        validarCantidadRegalo = function () {
            var cantidadAsignada = 0;
            for (var i = 0; i < $scope.regalos.length; i++) {
                //tiene en cuenta solo las cantidades de los demas regalos, para no contar dos veces el regalo seleccionado actualmente
                if ($scope.regalos[i].giftName !== $scope.regaloSeleccionado.giftName) {
                    for (var j = 0; j < $scope.regalos[i].items.length; j++) {
                        if ($scope.regalos[i].items[j].itemCode === $scope.productoUbicaciones.itemCode) {
                            var cantidadIncrementar = parseInt($scope.regalos[i].items[j].quantity);
                            cantidadAsignada += cantidadIncrementar;
                        }
                    }
                }
            }
            if (parseInt(cantidadAsignada) + parseInt($scope.cantidadRegalo) > parseInt($scope.productos[$scope.productoSeleccionado].cantidad)) {
                $scope.mensajeErrorRegalo = 'No se pueden agregar más unidades del producto a este regalo porque se supera la cantidad comprada.';
                return false;
            }
            $scope.mensajeErrorRegalo = null;
            return true;
        };

        $scope.obtenerCantidadRegalada = function (nombreRegalo) {
            for (var i = 0; i < $scope.regalos.length; i++) {
                if ($scope.regalos[i].giftName === nombreRegalo) {
                    for (var j = 0; j < $scope.regalos[i].items.length; j++) {
                        if ($scope.regalos[i].items[j].itemCode === $scope.productoUbicaciones.itemCode) {
                            return $scope.cantidadRegalo;
                        }
                    }
                }
            }
            return 0;
        };

        ///////////////////////////////////////////////////////////////////////////////
        ////////////////// Empleado ///////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////
        $scope.empleadosVentas = [];
        $scope.sucursalesVenta = [];
        $scope.empleadosSeleccionados = [];
        $scope.sucursalActiva = null;
        $scope.empleadoRetirado = null;

        $scope.cargarEmpleados = function () {
            $http.get(urlRest + 'empleado/list')
                .then(function (response) {
                    if (response.data) {
                        $scope.sucursalesVenta = response.data;
                        if ($scope.sucursalesVenta.length > 0) {
                            $scope.seleccionarSucursal($scope.sucursalesVenta[0]);
                        } else {
                            $scope.sucursalActiva = null;
                        }
                    } else {
                        console.error('No se encontraron empleados disponibles');
                    }
                });
        };

        $scope.seleccionarSucursal = function (sucursal) {
            $scope.sucursalActiva = sucursal;
            $scope.empleadosVentas = $scope.sucursalActiva.empleados;
        };

        $scope.seleccionarEmpleado = function (empleado) {
            var pos = $scope.obtenerPosicionEmpleado(empleado);
            if (pos >= 0) {
                $scope.empleadoRetirado = null;
                $scope.empleadosSeleccionados.splice(pos, 1);
                console.log("se quito el empleado " + empleado.nombre + " de la lista de seleccionados");
            } else {
                if ($scope.empleadosSeleccionados.length === 5) {
                    $scope.empleadoRetirado = $scope.empleadosSeleccionados[0];
                    console.log("quitando el primer empleado de la lista, ya que no se pueden tener mas de 5 empleados seleccionados (" + $scope.empleadosSeleccionados[0].cedula + ")");
                    $scope.empleadosSeleccionados.splice(0, 1);
                } else {
                    $scope.empleadoRetirado = null;
                }
                $scope.empleadosSeleccionados.push(empleado);
                console.log("se agrego el empleado " + empleado.nombre + " a la lista de seleccionados");
            }
        };

        $scope.obtenerPosicionEmpleado = function (empleado) {
            var i = 0;
            while (i < $scope.empleadosSeleccionados.length) {
                if ($scope.empleadosSeleccionados[i].cedula === empleado.cedula) {
                    return i;
                }
                i++;
            }
            return -1;
        };
        ///////////////////////////////////////////////////////////////////////////////
        ////////////////// Empaque ////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////
        $scope.totalBolsaS = 0;
        $scope.totalBolsaM = 0;
        $scope.totalBolsaL = 0;
        $scope.totalCajaS = 0;
        $scope.totalCajaM = 0;
        $scope.totalCajaL = 0;

        $scope.tiposEmpaque = [];

        $scope.crearRegistroEmpaqueVenta = function () {
            var referenciasEmpaque = [];
            var almacen = null;
            var cuenta = null;
            for (var i = 0; i < $scope.tiposEmpaque.length; i++) {
                if ($scope.tiposEmpaque[i].quantity > 0) {
                    var detalleEmpaque = {
                        referencia: $scope.tiposEmpaque[i].itemCode,
                        cantidad: $scope.tiposEmpaque[i].quantity
                    };
                    referenciasEmpaque.push(detalleEmpaque);
                    almacen = $scope.tiposEmpaque[i].whsCode;
                    cuenta = $scope.tiposEmpaque[i].accountCode;
                }

            }
            var empaqueVenta = {
                usuario: $scope.nombreEmpleado,
                numeroFactura: $scope.resultadoFactura.numeroFactura,
                almacen: almacen,
                cuenta: cuenta,
                referencias: referenciasEmpaque
            };
            $http.post(urlRest + 'empaqueventa', empaqueVenta).then(
                function (response) {
                    console.log(response);
                },
                function (response) {
                    console.error(response);
                }
            );
            $('#confirmacionFactura').modal('hide');
        };

        $scope.cargarTiposEmpaque = function () {
            $http.get(urlRest + 'empaqueventa/list/' + $scope.almacen)
                .then(function (response) {
                    if (response.data) {
                        $scope.tiposEmpaque = response.data;
                    } else {
                        console.error('No se encontraron empaques disponibles');
                    }
                });
        };

        $scope.agregarEmpaque = function (itemCode) {
            for (var i = 0; i < $scope.tiposEmpaque.length; i++) {
                if ($scope.tiposEmpaque[i].itemCode === itemCode) {
                    $scope.tiposEmpaque[i].quantity++;
                    break;
                }
            }
        };

        $scope.eliminarEmpaque = function (itemCode) {
            for (var i = 0; i < $scope.tiposEmpaque.length; i++) {
                if ($scope.tiposEmpaque[i].itemCode === itemCode && $scope.tiposEmpaque[i].quantity > 0) {
                    $scope.tiposEmpaque[i].quantity--;
                    break;
                }
            }
        };

        $scope.validarTipoEmpaque = function (providerCode, stringToLook) {
            if (providerCode.indexOf(stringToLook) === 0) {
                return true;
            } else {
                return false;
            }
        };

        $scope.validarProductoSeleccionado = function () {
            if ($scope.productos.length === 0 || $scope.ubicacionesProductos.length === 0) {
                return true; //envia true para deshabilitar el boton
            }
            return $scope.productos[$scope.productoSeleccionado].cantidad !==
                $scope.ubicacionesProductos[$scope.productoSeleccionado].exhibicion.seleccionado +
                $scope.ubicacionesProductos[$scope.productoSeleccionado].bodega.seleccionado;
        };

        compararItems = function (item1, item2) {
            return item2.lastModified - item1.lastModified;
        };

        validarSaldoProductos = function (mostrarModalUbicaciones) {
            var referencias = [];
            for (var i = 0; i < $scope.productos.length; i++) {
                referencias.push($scope.productos[i].itemCode);
            }
            $http.post(urlRest + 'iteminventario/consultastock/' + $scope.almacen, referencias).then(
                function (response) {
                    console.log(response);
                    for (var i = 0; i < response.data.length; i++) {
                        for (var j = 0; j < $scope.productos.length; j++) {
                            if (response.data[i].itemCode === $scope.productos[j].itemCode) {
                                $scope.productos[j].stock = response.data[i].stock;
                                $scope.productos[j].availableQuantity = response.data[i].availableQuantity;
                                break;
                            }
                        }
                    }
                    //TODO: validar si algun producto ya no tiene saldo
                    if (mostrarModalUbicaciones) {
                        mostrarUbicaciones();
                    }
                }
            );
        };

        mostrarUbicaciones = function () {
            //selecciona el primer producto para visualizarlo
            $scope.productoUbicaciones = null;
            $scope.productoSeleccionado = 0;
            $scope.ubicacionesProductos = [];
            if ($scope.productos.length - 1 >= $scope.productoSeleccionado) {
                for (var j = 0; j < $scope.productos.length; j++) {
                    $scope.productoUbicaciones = $scope.productos[j];
                    var stock = $scope.productoUbicaciones.stock;
                    for (var i = 0; i < stock.length; i++) {
                        agregarUbicacionReferencia($scope.productoUbicaciones.itemCode, stock[i].warehouseCode, stock[i].binCode, stock[i].binAbs, stock[i].quantity);
                    }
                }
                $scope.productoUbicaciones = $scope.productos[$scope.productoSeleccionado];
                $('#ubicaciones').modal({
                    show: true,
                    keyboard: true,
                    backdrop: 'static'
                });
            } else {
                console.error('No se pudo mostrar el panel de seleccion de ubicaciones porque se intento mostrar el producto ' + ($scope.productoSeleccionado) + ' de ' + $scope.productos.length);
            }
        };
    });
})();
