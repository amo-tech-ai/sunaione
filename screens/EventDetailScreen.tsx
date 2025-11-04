
import React from 'react';
import { Screen, Event } from '../types';
import { ChevronLeftIcon, CalendarIcon, MapPinIcon, UsersIcon } from '../components/Icons';

interface EventDetailScreenProps {
    eventId: string;
    setCurrentScreen: (screen: Screen) => void;
    events: Event[];
    onRegisterToggle: (eventId: string) => void;
}

const EventDetailScreen: React.FC<EventDetailScreenProps> = ({ eventId, setCurrentScreen, events, onRegisterToggle }) => {
    const event = events.find(e => e.id === eventId);

    if (!event) {
        return (
            <div>
                <button onClick={() => setCurrentScreen(Screen.Events)} className="flex items-center gap-2 text-gray-600 font-semibold mb-6 hover:text-sunai-dark transition-colors">
                    <ChevronLeftIcon className="w-5 h-5" />
                    Back to All Events
                </button>
                <h1 className="text-2xl font-bold">Event not found</h1>
            </div>
        );
    }

    const registrationPercentage = (event.registeredCount / event.totalSpots) * 100;

    const getButtonState = () => {
        if (event.status !== 'Upcoming') {
            return { text: 'Event Closed', disabled: true, className: 'bg-gray-500 cursor-not-allowed' };
        }
        if (event.registered) {
            return { text: 'Unregister', disabled: false, className: 'bg-gray-600 hover:bg-gray-700' };
        }
        return { text: 'Register for this Event', disabled: false, className: 'bg-sunai-orange hover:bg-opacity-90' };
    };
    const buttonState = getButtonState();

    return (
        <div>
            <button onClick={() => setCurrentScreen(Screen.Events)} className="flex items-center gap-2 text-gray-600 font-semibold mb-6 hover:text-sunai-dark transition-colors">
                <ChevronLeftIcon className="w-5 h-5" />
                Back to All Events
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2">
                    <img src={event.image} alt={event.title} className="w-full h-80 object-cover rounded-2xl shadow-lg mb-6" />
                    <span className="bg-orange-100 text-sunai-orange font-bold text-sm px-3 py-1 rounded-full">{event.category}</span>
                    <h1 className="text-4xl font-bold text-sunai-dark my-4">{event.title}</h1>
                    <p className="text-lg text-gray-600 leading-relaxed">{event.description}</p>
                    
                    {event.agenda && event.agenda.length > 0 && (
                        <div className="mt-8">
                            <h2 className="text-2xl font-bold text-sunai-dark mb-4">Agenda</h2>
                            <div className="space-y-4">
                                {event.agenda.map((item, index) => (
                                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                        <div className="font-bold text-sunai-orange w-24 text-right">{item.time}</div>
                                        <div>
                                            <p className="font-semibold text-gray-800">{item.topic}</p>
                                            {item.speaker && <p className="text-sm text-gray-500">with {item.speaker}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {event.speakers && event.speakers.length > 0 && (
                        <div className="mt-8">
                            <h2 className="text-2xl font-bold text-sunai-dark mb-4">Speakers</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {event.speakers.map((speaker, index) => (
                                    <div key={index} className="text-center">
                                        <img src={speaker.image} alt={speaker.name} className="w-24 h-24 rounded-full mx-auto mb-2 object-cover" />
                                        <p className="font-bold text-gray-800">{speaker.name}</p>
                                        <p className="text-sm text-gray-500">{speaker.title}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <aside className="lg:col-span-1 bg-white rounded-xl shadow-md border border-gray-200 p-6 sticky top-8">
                    <h3 className="text-xl font-bold text-sunai-dark mb-4">Event Details</h3>
                    <div className="space-y-4 text-gray-700">
                        <div className="flex items-start gap-3">
                            <CalendarIcon className="w-5 h-5 mt-1 text-gray-400 flex-shrink-0" />
                            <div>
                                <p className="font-semibold">{event.date}</p>
                                <p className="text-sm text-gray-500">{event.time}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <MapPinIcon className="w-5 h-5 mt-1 text-gray-400 flex-shrink-0" />
                            <div>
                                <p className="font-semibold">{event.isVirtual ? 'Virtual Event' : event.location}</p>
                                {event.isVirtual && <p className="text-sm text-gray-500">Link will be provided</p>}
                            </div>
                        </div>
                         <div className="flex items-start gap-3">
                            <UsersIcon className="w-5 h-5 mt-1 text-gray-400 flex-shrink-0" />
                            <div>
                                <p className="font-semibold">{event.registeredCount} / {event.totalSpots} Registered</p>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                                    <div className="bg-sunai-orange h-2.5 rounded-full" style={{ width: `${registrationPercentage}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button 
                        className={`w-full mt-6 text-white font-bold py-3 rounded-lg shadow-md transition-all ${buttonState.className}`}
                        disabled={buttonState.disabled}
                        onClick={() => onRegisterToggle(event.id)}
                    >
                        {buttonState.text}
                    </button>
                </aside>
            </div>
        </div>
    );
};

export default EventDetailScreen;