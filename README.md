## Leofee
## User Stories

- Als Schüler möchte ich mich über einen QR-Code in die Website einloggen können, um auf meine Daten und Funktionen 
  zuzugreifen.

- Als Schüler möchte ich die Webanwendung auf meinem Handy nutzen können, um auf die Funktionen der Anwendung zuzugreifen

- Als Kassierer möchte ich einen QR-Code scannen und verifizieren können. Bei erfolgreicher Verifizierung soll der Betrag 
  reduziert und der Bon eingebucht werden. Bei Misserfolg soll ein Fehler angezeigt werden.

- Als Administrator möchte ich ein eigenes Design für die Schülerverwaltung in der Leofee-Anwendung haben, um eine 
 benutzerfreundliche Oberfläche zu gewährleisten.

- Als Administrator möchte ich die Möglichkeit haben, Schülerdaten zu exportieren, um nachzuverfolgen, wer welchen Bon 
 eingelöst hat. Der Export soll im CSV-Format erfolgen.

- Als Administrator möchte ich Statistiken für das Buffet erstellen können, einschließlich Summen und Graphen, um einen 
  Überblick über die Aktivitäten zu erhalten.



## Anwendung

1) OAUT, Angular ASP .dnet Prototype. Mobile App am Schüler Handy 

2) SVA: Leofee Admin. Eigenes Design. Für Schülerverwaltung (CRUD). Import. Höhe des Bons festlegen. vlt Preise Festlegen? 
 
3) QR-Code für S-Mobile-App. Public Deployment: VM => vm64.htl-leonding. 

4) KA: Kassa App neu machen/migrieren. Redesign? Mulit-Buffet -> Raus.  

5) SMA: Hat Aut Schüler Bon schon eingelöst? (Respond: Bon ja/nein oder vlt Betrag?). Wenn offener Bon => QR-Code generien  

6) SMA: Für Anzeige: Response überprüfen und dementsprächend Anzeige (QR-Code/ Ablehnung). 

7) KA: Scannt den QR-Code und verifiziert. Wenn Ok => Betrag reduziern und Bon einbuchen. Wenn nicht Ok -> Fehler anzeigen 

8) SVA: Export der SchülerDaten(Wer hat welchen Bon eingelöst? csv export). Buffet Statistik (Summen, Graphen....)
