import { useState, useEffect, useContext } from "react";
import PairingApp from "../components/PairingApp";
import pairingUrl from "../assets/pairing.png";
import {
  fetchCalendarInfo,
  OnlyCalendarInfo,
  storeCalendarInfo,
} from "../model/Storage";
import { ApiKeyContext } from "../App";

const DEFAULT_ROTATION_FREQUENCY = 1;

export default function () {
  const [calendarInfo, setCalendarInfo] = useState<OnlyCalendarInfo>({
    names: ["Paco", "Alejandro", "Elna", "Laura"],
    description: "",
    untilDate: "",
    rotation_frequency: DEFAULT_ROTATION_FREQUENCY.toString(),
  });

  const [namesString, setNamesString] = useState<string>("");
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | undefined>();

  const apiKey = useContext(ApiKeyContext);
  console.log(apiKey);

  const dateIsInThePast =
    calendarInfo.untilDate && new Date(calendarInfo.untilDate) < new Date();

  useEffect(() => {
    if (apiKey) {
      fetchCalendarInfo(apiKey)
        .then((result: OnlyCalendarInfo) => {
          setNamesString(result.names.join("\n"));
          setCalendarInfo(result);
        })
        .catch((error) => console.log("error", error));
    }
  }, [apiKey]);

  const updateCalendarInfo = (data: Partial<OnlyCalendarInfo>) => {
    setCalendarInfo({ ...calendarInfo, ...data });

    if (apiKey) {
      timeoutId && clearTimeout(timeoutId);
      setTimeoutId(setTimeout(() => storeCalendarInfo(apiKey, data), 3000));
    }
  };

  function onChangeNames(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setNamesString(event.target.value);
    updateCalendarInfo({
      ...calendarInfo,
      names: event.target.value.trim().split("\n"),
    });
  }

  const onChangeRotationFrequency = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    updateCalendarInfo({
      ...calendarInfo,
      rotation_frequency: event.target.value,
    });
  };

  const onChangeDescription = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    updateCalendarInfo({ ...calendarInfo, description: event.target.value });
  };

  const onChangeUntilDate = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateCalendarInfo({ ...calendarInfo, untilDate: event.target.value });
  };

  const isValidRotationFrequency = (value: string | undefined): boolean => {
    const almostNumber = value && parseInt(value);

    return !!almostNumber && almostNumber > 0;
  };

  const parseIntOrDefault = (value: string): number => {
    return isValidRotationFrequency(value)
      ? parseInt(value)
      : DEFAULT_ROTATION_FREQUENCY;
  };

  return (
    <div className="list-none text-center flex items-center flex-col">
      <nav className={"flex items-center justify-center flex-wrap p-6"}>
        <div className={"flex items-center flex-shrink-0 text-white mr-6"}>
          <img className="w-1/4" src={pairingUrl} alt="Pairing logo" />
          <span
            className={"font-semibold text-xl tracking-tight text-gray-900"}
          >
            Pairing calendar
          </span>
        </div>
      </nav>
      <form className={"w-full max-w-4xl"}>
        <div className={"flex grid-cols-2 flex-wrap -mx-3 mb-6"}>
          <div className={"row-span-1 px-3 mb-6 md:mb-0"}>
            <label
              className={
                "block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              }
              htmlFor="participants"
            >
              Participants
            </label>
            <textarea
              value={namesString}
              onChange={onChangeNames}
              className={
                "h-40 appearance-none block w-full text-gray-700 rounded border-2 border-gray-200 py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
              }
              id="participants"
            />
            <p className={"text-xs italic"}>One participant per line.</p>
            <label
              className={
                "block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2 mt-2"
              }
              htmlFor="rotation-frequency"
            >
              Rotation frequency (in days)
            </label>
            <input
              value={calendarInfo.rotation_frequency}
              onChange={onChangeRotationFrequency}
              className={
                "appearance-none block w-full text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              }
              id="rotation-frequency"
              type="text"
            />
            {!isValidRotationFrequency(calendarInfo.rotation_frequency) && (
              <p className={"text-red-600 text-xs italic mt-2"}>
                Wrong value! Using default (1).
              </p>
            )}
          </div>
          <div className={"w-full md:w-1/2"}>
            <label
              className={
                "block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              }
              htmlFor="description"
            >
              Description
            </label>
            <textarea
              value={calendarInfo.description}
              onChange={onChangeDescription}
              className={
                "h-40 appearance-none block w-full text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              }
              id="description"
              placeholder="Introduce extra text for description &#10;Room 1: https://thoughtworks.zoom.us/j/calendarGenerator"
            />
            <label
              className={
                "mt-9 block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              }
              htmlFor="until-date"
            >
              Create events until date?
            </label>
            <input
              onChange={onChangeUntilDate}
              value={calendarInfo.untilDate}
              className={
                "appearance-none block w-full text-gray-700 border border-gray-200 rounded py-2 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              }
              id="until-date"
              type="date"
            />

            {dateIsInThePast && (
              <p className={"text-red-600 text-xs italic mt-2"}>
                The selected date is in the past...
              </p>
            )}
            <p className={"text-xs italic mt-2"}>Leave empty for non ending.</p>
          </div>
        </div>
      </form>
      <PairingApp
        names={calendarInfo.names}
        rotationFrequency={parseIntOrDefault(calendarInfo.rotation_frequency)}
        description={calendarInfo.description}
        untilDate={
          calendarInfo.untilDate ? new Date(calendarInfo.untilDate) : undefined
        }
      />
      <div className="mt-2">
        Made with{" "}
        <span className="text-red-400" style={{ display: "contents" }}>
          &#9829;
        </span>{" "}
        by{" "}
        <a
          className="text-blue-500"
          href="https://github.com/alexgt9"
          target="_blank"
          rel="noreferrer"
        >
          Alejandro Batanero
        </a>
      </div>
    </div>
  );
}
