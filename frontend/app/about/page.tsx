export default function About() {
  return (
    <div
      className="max-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/media/exoplanet.png')" }}
    >
      <div className="backdrop-blur-md bg-black/40 p-10 m-40 rounded-2xl border border-white/20 text-center max-w-xl">
        <h1 className="text-4xl font-bold text-cyan-300 mb-4">About This Project</h1>
        <p className="text-lg text-gray-300 leading-relaxed">
          This exoplanet classification system was created by
          <span className="font-bold text-white"> Soham Gurav</span>, 
          <span className="font-bold text-white"> Shreyas Menon</span>,
          <span className="font-bold text-white"> Piyush Bambori</span>,
          <span className="font-bold text-white"> Om Bankar</span>,
          combining astronomy, machine learning, and modern web development.
        </p>
      </div>
    </div>
  );
}
