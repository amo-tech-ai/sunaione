import React from 'react';
import { Event } from '../types';
import { ChevronLeftIcon, CalendarIcon, MapPinIcon, UsersIcon } from '../components/Icons';
import { useNavigate } from 'react-router-dom';

interface EventDetailScreenProps {
    eventId: string;
    events: Event[];
    onRegisterToggle: (eventId: string) => void;
}

const EventDetailScreen: React.FC<EventDetailScreenProps> = ({ eventId, events, onRegisterToggle }) => {
    const navigate = useNavigate();
    const event = events.find(e => e.id === eventId);

    const mainContent = event ? (
        <>
            <button onClick={() => navigate('/events')} className="flex items-center gap-2 text-gray-600 font-semibold mb-6 hover:text-amo-dark transition-colors">
                <ChevronLeftIcon className="w-5 h-5" />
                Back to All Events
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2">
                    <img src={event.image} alt={event.title} className="w-full h-80 object-cover rounded-2xl shadow-lg mb-6" />
                    <span className="bg-orange-100 text-amo-orange font-bold text-sm px-3 py-1 rounded-full">{event.category}</span>
                    <h1 className="text-4xl font-bold text-amo-dark my-4">{event.title}</h1>
                    <p className="text-lg text-gray-600 leading-relaxed">{event.description}</p>
                    
                    {event.agenda && event.agenda.length > 0 && (
                        <div className="mt-8">
                            <h2 className="text-2xl font-bold text-amo-dark mb-4">Agenda</h2>
                            <div className="space-y-4">
                                {event.agenda.map((item, index) => (
                                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                        <div className="font-bold text-amo-orange w-24 text-right">{item.time}</div>
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
                            <h2 className="text-2xl font-bold text-amo-dark mb-4">Speakers</h2>
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
                    <h3 className="text-xl font-bold text-amo-dark mb-4">Event Details</h3>
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
                                    <div className="bg-amo-orange h-2.5 rounded-full" style={{ width: `${(event.registeredCount / event.totalSpots) * 100}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button 
                        className={`w-full mt-6 text-white font-bold py-3 rounded-lg shadow-md transition-all ${event.status !== 'Upcoming' ? 'bg-gray-500 cursor-not-allowed' : (event.registered ? 'bg-gray-600 hover:bg-gray-700' : 'bg-amo-orange hover:bg-opacity-90')}`}
                        disabled={event.status !== 'Upcoming'}
                        onClick={() => onRegisterToggle(event.id)}
                    >
                        {event.status !== 'Upcoming' ? 'Event Closed' : (event.registered ? 'Unregister' : 'Register for this Event')}
                    </button>
                </aside>
            </div>
        </>
    ) : (
        <>
            <button onClick={() => navigate('/events')} className="flex items-center gap-2 text-gray-600 font-semibold mb-6 hover:text-amo-dark transition-colors">
                <ChevronLeftIcon className="w-5 h-5" />
                Back to All Events
            </button>
            <h1 className="text-2xl font-bold">Event not found</h1>
        </>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            {mainContent}
        </div>
    );
};

export default EventDetailScreen;