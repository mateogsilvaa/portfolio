import os
D = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "cv")
s = open(os.path.join(D, "cv.html"), encoding="utf8").read()
R = [('lang="es"', 'lang="en"'),
('Estudiante de Ingeniería Informática e IA aplicada a la Robótica', 'Computer Engineering and AI for Robotics student'),
('<b>Correo</b>', '<b>Email</b>'), ('<b>Residencia</b> Madrid, España', '<b>Based in</b> Madrid, Spain'),
('Estudiante de segundo curso de Ingeniería Informática en la Universidad Francisco de Vitoria. Compagino la carrera con el atletismo y con proyectos web propios, casi siempre sobre atletismo y datos. Me gusta aprender construyendo cosas y trabajar en equipo.', 'Second-year Computer Engineering student at Universidad Francisco de Vitoria (Madrid). I combine my degree with athletics and my own web projects, mostly about athletics and data. I like learning by building things and working in a team.'),
('Educación y formación', 'Education and training'), ('2025 – actualidad', '2025 – present'), ('2026 – actualidad', '2026 – present'), ('2024 – actualidad', '2024 – present'),
('Grado en Ingeniería Informática, mención en IA aplicada a la Robótica', 'Bachelor’s in Computer Engineering, specialisation in AI for Robotics'),
('2.º curso de cuatro. Delegado de clase.', 'Second year of four. Class representative.'),
('Programa Talento IA (beca formativa)', 'Talento IA programme (training scholarship)'),
('Real Federación Española de Atletismo', 'Royal Spanish Athletics Federation (RFEA)'),
('Itinerario de un curso en inteligencia artificial y analítica aplicada al alto rendimiento, compatible con los estudios y la competición, con proyecto de aprendizaje propio.', 'One-year track in artificial intelligence and analytics for high performance, compatible with studies and competition, including a personal learning project.'),
('<h3>Bachillerato</h3>', '<h3>Upper secondary education (Bachillerato)</h3>'),
('Cuatro años como consejero escolar; delegado, subdelegado y otros cargos de representación de los alumnos.', 'Four years on the school council; class representative, deputy and other student representation roles.'),
('Global Classrooms (nov 2021 – mar 2022): modelo de Naciones Unidas, representando a Etiopía y después a Japón.', 'Global Classrooms (Nov 2021 – Mar 2022): Model United Nations, representing Ethiopia and then Japan.'),
('Experiencia y proyectos', 'Experience and projects'),
('Cofundador · Mundo Atletismo', 'Co-founder · Mundo Atletismo'),
('Web con los resultados del atletismo español: rankings, campeonatos, mínimas, atletas, clubes y pistas sobre más de seis millones de marcas. React, TypeScript, Vite y Firebase.', 'Website with the results of Spanish athletics: rankings, championships, entry standards, athletes, clubs and tracks across more than six million marks. React, TypeScript, Vite and Firebase.'),
('Fundador · Lanedata', 'Founder · Lanedata'),
('Periodismo de datos sobre el atletismo español: elijo las preguntas, preparo los datos, escribo los análisis y mantengo la web. Next.js, TypeScript y Supabase.', 'Data journalism about Spanish athletics: I choose the questions, prepare the data, write the analysis and maintain the site. Next.js, TypeScript and Supabase.'),
('Creador · Bicifastness y Tripfinder', 'Creator · Bicifastness and Tripfinder'),
('Una liga para usuarios de BiciMAD en Madrid (proyecto independiente) y un buscador de vuelos baratos de fin de semana con avisos de precio (Python, JavaScript, Firebase, GitHub Actions).', 'A league for BiciMAD bike-share riders in Madrid (independent project) and a cheap weekend flight finder with price alerts (Python, JavaScript, Firebase, GitHub Actions).'),
('Departamento eléctrico · UFV Racing Team', 'Electrical department · UFV Racing Team'),
('Modelado y simulación del comportamiento del monoplaza con MATLAB y Simulink.', 'Modelling and simulation of the single-seater’s behaviour with MATLAB and Simulink.'),
('<h2>Premios</h2>', '<h2>Awards</h2>'),
('Primer premio · San Esteban Tech Challenge 2026', 'First prize · San Esteban Tech Challenge 2026'),
('Con un equipo de cinco estudiantes de la UFV: <i>Aire Claro</i>, una propuesta de sensores, avisos vecinales y web pública para vigilar la futura planta de biometano de San Esteban de Gormaz (Soria).', 'With a team of five UFV students: <i>Aire Claro</i>, a proposal of sensors, residents’ reports and a public website to monitor the future biomethane plant in San Esteban de Gormaz (Soria, Spain).'),
('<h2>Voluntariado</h2>', '<h2>Volunteering</h2>'),
('Acompañamiento infantil · Fundación Talento MCR', 'Children’s hospital volunteer · Fundación Talento MCR'),
('Acompañamiento a niños hospitalizados en el Hospital 12 de Octubre y el Hospital Niño Jesús (Madrid).', 'Keeping hospitalised children company at Hospital 12 de Octubre and Hospital Niño Jesús (Madrid).'),
('Julio 2024', 'July 2024'),
('Voluntariado internacional en Nepal · AIPC Pandora', 'International volunteering in Nepal · AIPC Pandora'),
('Tres semanas colaborando en proyectos con la comunidad local (16 h de formación previa y 90 h en terreno).', 'Three weeks working on projects with the local community (16 h of prior training and 90 h of fieldwork).'),
('Competencias lingüísticas', 'Language skills'), ('Lengua materna', 'Mother tongue'), ('<h3>Español</h3>', '<h3>Spanish</h3>'), ('Otras lenguas', 'Other languages'),
('Comprensión auditiva', 'Listening'), ('Comprensión lectora', 'Reading'), ('Interacción oral', 'Spoken interaction'), ('Expresión oral', 'Spoken production'), ('Expresión escrita', 'Writing'),
('<b>Inglés</b>', '<b>English</b>'),
('Cambridge B2 First (176), junio 2023. Niveles según el Marco Común Europeo de Referencia (MCER).', 'Cambridge B2 First (176), June 2023. Levels according to the Common European Framework of Reference (CEFR).'),
('Competencias digitales', 'Digital skills'), ('>Herramientas<', '>Tools<'), ('Análisis de datos', 'Data analysis'), ('>Certificaciones<', '>Certifications<'),
('Otras competencias', 'Other skills'), ('>Deporte<', '>Sport<'), ('Atleta en activo.', 'Competing athlete.'), ('>Personales<', '>Personal<'),
('Trabajo en equipo, representación y oratoria, autonomía y adaptación a otros entornos culturales.', 'Teamwork, representation and public speaking, independence and adapting to other cultures.'),
]
for a, b in R:
    assert a in s, a
    s = s.replace(a, b)
open(os.path.join(D, "cv-en.html"), "w", encoding="utf8").write(s)
print("ok")
