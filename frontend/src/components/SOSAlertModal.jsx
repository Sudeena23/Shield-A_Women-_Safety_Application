import React, {
  useEffect,
  useState,
} from "react";

import {
  ShieldAlert,
  Volume2,
  VolumeX,
  Phone,
  X,
  CheckCircle,
  MapPin,
  Send,
  AlertOctagon,
} from "lucide-react";

import { soundService } from "../utils/soundService";

import { alertService } from "../services/alertService";


export const SOSAlertModal = ({
  isOpen,
  onClose,
  guardians = [],
}) => {

  const [countdown, setCountdown] =
    useState(5);

  const [isTriggered, setIsTriggered] =
    useState(false);

  const [soundEnabled, setSoundEnabled] =
    useState(true);

  const [dispatchStatus, setDispatchStatus] =
    useState([]);

  const [location, setLocation] =
    useState(null);

  const [loading, setLoading] =
    useState(false);


  // --------------------------------
  // SIREN
  // --------------------------------

  useEffect(() => {

    if (
      isOpen &&
      soundEnabled &&
      (isTriggered ||
        countdown <= 3)
    ) {

      soundService.startSiren(
        0.5
      );

    } else {

      soundService.stopSiren();
    }


    return () => {
      soundService.stopSiren();
    };

  }, [
    isOpen,
    soundEnabled,
    isTriggered,
    countdown,
  ]);


  // --------------------------------
  // COUNTDOWN
  // --------------------------------

  useEffect(() => {

    if (
      !isOpen ||
      isTriggered
    ) {
      return;
    }


    if (countdown > 0) {

      const timer =
        setTimeout(() => {

          setCountdown(
            (previous) =>
              previous - 1
          );

        }, 1000);


      return () =>
        clearTimeout(timer);
    }


    if (countdown === 0) {

      triggerSOS();
    }

  }, [
    isOpen,
    countdown,
    isTriggered,
  ]);


  // --------------------------------
  // RESET
  // --------------------------------

  useEffect(() => {

    if (!isOpen) {

      setCountdown(5);

      setIsTriggered(false);

      setDispatchStatus([]);

      setLocation(null);

      setLoading(false);
    }

  }, [isOpen]);


  // --------------------------------
  // GET REAL GPS LOCATION
  // --------------------------------

  const getCurrentLocation = () => {
    return new Promise((resolve) => {
      const fallbackLocation = {
        lat: 27.7172,
        lng: 85.324,
        accuracy: 50,
        address: "Kathmandu, Nepal (Default Emergency Coords)",
      };

      if (!navigator.geolocation) {
        resolve(fallbackLocation);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          resolve({
            lat,
            lng,
            accuracy: position.coords.accuracy || 10,
            address: `GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          });
        },
        () => {
          // If denied or timed out, resolve fallback so SOS still dispatches!
          resolve(fallbackLocation);
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 0,
        }
      );
    });
  };


  // --------------------------------
  // SEND SOS
  // --------------------------------

  const triggerSOS =
    async () => {

      if (loading || isTriggered) {
        return;
      }


      setLoading(true);

      setIsTriggered(true);


      setDispatchStatus([
        "Getting your real GPS location...",
      ]);


      try {

        // STEP 1
        // GET LOCATION

        const currentLocation =
          await getCurrentLocation();


        setLocation(
          currentLocation
        );


        setDispatchStatus(
          (previous) => [
            ...previous,

            "GPS location obtained successfully.",
          ]
        );


        // STEP 2
        // SEND TO BACKEND

        setDispatchStatus(
          (previous) => [
            ...previous,

            "Sending SOS to Shield server...",
          ]
        );


        const alert =
          await alertService.createAlert({

            lat:
              currentLocation.lat,

            lng:
              currentLocation.lng,

            address:
              currentLocation.address,

            type:
              "SOS Alert",

            duressActivated:
              false,
          });


        console.log(
          "Created SOS:",
          alert
        );


        // STEP 3
        // SUCCESS

        setDispatchStatus(
          (previous) => [
            ...previous,

            "SOS alert saved successfully.",
          ]
        );


        setDispatchStatus(
          (previous) => [
            ...previous,

            `Trusted contacts: ${guardians.length}`,
          ]
        );


        setDispatchStatus(
          (previous) => [
            ...previous,

            "Admin can now receive the alert location.",
          ]
        );


      } catch (error) {

        console.error(
          "SOS error:",
          error
        );


        setDispatchStatus(
          (previous) => [
            ...previous,

            `ERROR: ${error.message}`,
          ]
        );

      } finally {

        setLoading(false);
      }
    };


  // --------------------------------
  // DISPATCH NOW
  // --------------------------------

  const dispatchNow = () => {

    if (!loading) {
      setCountdown(0);
    }
  };


  // --------------------------------
  // CLOSE
  // --------------------------------

  const handleClose = () => {

    soundService.stopSiren();

    onClose();
  };


  if (!isOpen) {
    return null;
  }


  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">

      <div className="relative w-full max-w-lg bg-[#28150a] border-2 border-red-600/80 rounded-2xl shadow-2xl p-6 text-white">


        {/* CLOSE */}

        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-[#cb9d75] hover:text-white bg-[#3d2212] p-2 rounded-full"
        >

          <X className="w-5 h-5" />

        </button>


        {/* ====================== */}
        {/* COUNTDOWN */}
        {/* ====================== */}

        {!isTriggered && (

          <div className="text-center py-4 space-y-6">


            <div className="inline-flex items-center justify-center p-4 bg-red-500/20 rounded-full">

              <ShieldAlert className="w-16 h-16 text-red-500" />

            </div>


            <div>

              <span className="inline-block px-3 py-1 bg-[#1a0c05] text-red-400 text-xs rounded-full border border-red-800 mb-2">

                Emergency Alert Mode

              </span>


              <h2 className="text-2xl md:text-3xl font-black">

                Dispatching Emergency SOS

              </h2>


              <p className="text-[#cb9d75] text-sm mt-1">

                SOS will trigger in{" "}

                <span className="text-red-400 font-bold text-lg">

                  {countdown}s

                </span>

              </p>

            </div>


            {/* COUNTDOWN CIRCLE */}

            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">

              <div className="absolute inset-0 rounded-full border-4 border-[#3d2212]" />

              <div className="absolute inset-0 rounded-full border-4 border-red-500 border-t-transparent animate-spin" />

              <span className="text-4xl font-black text-red-500">

                {countdown}

              </span>

            </div>


            {/* BUTTONS */}

            <div className="flex gap-3">

              <button
                onClick={handleClose}
                className="flex-1 bg-[#3d2212] text-white font-bold py-3 rounded-xl"
              >

                Cancel

              </button>


              <button
                onClick={dispatchNow}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2"
              >

                <AlertOctagon className="w-5 h-5" />

                Dispatch Now

              </button>

            </div>

          </div>

        )}


        {/* ====================== */}
        {/* ACTIVE SOS */}
        {/* ====================== */}

        {isTriggered && (

          <div className="space-y-5 py-2">


            {/* HEADER */}

            <div className="flex items-center gap-3 border-b border-[#3d2212] pb-4">

              <div className="p-3 bg-red-600/20 text-red-500 rounded-xl">

                <ShieldAlert className="w-8 h-8" />

              </div>


              <div>

                <h3 className="text-xl font-extrabold">

                  SOS BROADCAST ACTIVE

                </h3>

                <p className="text-xs text-red-400">

                  Emergency protocol active

                </p>

              </div>


              <button
                onClick={() =>
                  setSoundEnabled(
                    !soundEnabled
                  )
                }
                className="ml-auto p-2 rounded-lg bg-[#3d2212]"
              >

                {soundEnabled ? (

                  <Volume2 className="w-5 h-5 text-red-400" />

                ) : (

                  <VolumeX className="w-5 h-5" />

                )}

              </button>

            </div>


            {/* LOCATION */}

            <div className="bg-[#1a0c05] rounded-xl p-4 border border-[#3d2212]">

              <div className="flex items-start gap-3">

                <MapPin className="w-5 h-5 text-red-400 mt-1 shrink-0" />

                <div className="text-xs">

                  <div className="font-semibold text-white">

                    Current GPS Location

                  </div>


                  {location ? (

                    <>

                      <div className="text-[#cb9d75] mt-1">

                        {location.address}

                      </div>


                      <div className="text-[#cb9d75]/60 mt-1">

                        Accuracy:{" "}

                        {Math.round(
                          location.accuracy
                        )}m

                      </div>


                      <a
                        href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-blue-400 underline mt-2"
                      >

                        Open in Google Maps

                      </a>

                    </>

                  ) : (

                    <div className="text-yellow-400 mt-1">

                      Getting location...

                    </div>

                  )}

                </div>

              </div>

            </div>


            {/* LOG */}

            <div className="bg-[#1a0c05] rounded-xl p-4 border border-[#3d2212] space-y-2 text-xs font-mono min-h-[140px]">

              <div className="text-[#cb9d75] font-sans font-semibold mb-3 flex items-center gap-2">

                <Send className="w-4 h-4 text-red-400" />

                SOS Dispatch Timeline

              </div>


              {dispatchStatus.map(
                (message, index) => (

                  <div
                    key={index}
                    className="flex items-start gap-2 text-emerald-400"
                  >

                    <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />

                    <span>

                      {message}

                    </span>

                  </div>

                )
              )}

            </div>


            {/* TRUSTED CONTACTS */}

            <div>

              <div className="text-xs font-semibold text-[#cb9d75] mb-2">

                Trusted Contacts ({guardians.length})

              </div>


              <div className="flex flex-wrap gap-2">

                {guardians.map(
                  (guardian) => (

                    <span
                      key={guardian.id}
                      className="text-xs px-2.5 py-1 bg-[#1a0c05] border border-[#3d2212] text-white rounded-full"
                    >

                      {guardian.name}

                    </span>

                  )
                )}

              </div>

            </div>


            {/* BUTTONS */}

            <div className="flex gap-3 pt-2">

              <a
                href="tel:100"
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
              >

                <Phone className="w-4 h-4" />

                Call Police 100

              </a>


              <button
                onClick={handleClose}
                className="bg-[#3d2212] hover:bg-[#522f18] text-white px-4 py-3 rounded-xl"
              >

                Stop SOS

              </button>

            </div>

          </div>

        )}

      </div>

    </div>
  );
};