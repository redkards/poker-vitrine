<?php

namespace App\Content;

use App\Enum\VideoLevel;

/**
 * Contenu de base du site (catégories du forum, vidéos CC BY), partagé par les fixtures
 * et la commande app:content:seed utilisable en production.
 */
final class DefaultContent
{
    /**
     * @var list<array{string, string, string}>
     */
    public const FORUM_CATEGORIES = [
        ['debutants', 'Débutants', 'Règles, vocabulaire, premières questions : aucune question n’est bête.'],
        ['analyses-de-mains', 'Analyses de mains', 'Postez une main jouée et demandez l’avis de la communauté.'],
        ['tournois', 'Tournois', 'MTT, Sit & Go, tournois live : stratégie et retours d’expérience.'],
        ['cash-game', 'Cash game', 'Parties à blindes fixes, en ligne ou en club.'],
        ['mental-bankroll', 'Mental & bankroll', 'Tilt, gestion du capital, organisation des sessions.'],
        ['vie-du-site', 'Vie de la communauté', 'Présentations, suggestions et annonces.'],
    ];

    /**
     * Vidéos de démonstration : uniquement des vidéos sous licence Creative Commons vérifiée
     * (les vidéos de chaînes tierces Kill Tilt et zChance44 ont été retirées à la demande du propriétaire).
     *
     * Licence CC BY vérifiée sur la page YouTube de chaque vidéo le 29/10/2026 : l'auteur et la licence
     * doivent rester crédités dans la description.
     *
     * @var list<array{string, string, string, VideoLevel, string}>
     */
    public const VIDEOS = [
        ['Poker Hand Rankings : quelle main bat quelle main ?', 'https://www.youtube.com/watch?v=FtPEAIV8STw', 'Règles', VideoLevel::Debutant, "Hiérarchie des combinaisons et lecture du tableau en Hold'em (en anglais, 28 min). Vidéo de Ryan Morales, licence Creative Commons Attribution (CC BY)."],
        ['Limit, No-Limit, Pot-Limit : quelles différences ?', 'https://www.youtube.com/watch?v=13tU6Jmyj5o', 'Règles', VideoLevel::Debutant, "Les trois structures d'enchères expliquées simplement (en anglais, 4 min). Vidéo d'AceHighTV, licence Creative Commons Attribution (CC BY)."],
        ['Bankroll management : bien gérer son capital', 'https://www.youtube.com/watch?v=c-p52T0t1O4', 'Gestion', VideoLevel::Debutant, "Gérer son capital de jeu avec un calculateur (en anglais, 38 min). Vidéo de WinnerInAWeek, licence Creative Commons Attribution (CC BY)."],
        ['Poker et probabilités : analyse combinatoire', 'https://www.youtube.com/watch?v=SU1EU529d_8', 'Stratégie', VideoLevel::Intermediaire, "Calculer la probabilité des mains grâce à la combinatoire (14 min). Vidéo de Patrick Anastasoglou, licence Creative Commons Attribution (CC BY)."],
        ['Cotes du pot et équité des tirages', 'https://www.youtube.com/watch?v=_X8Sy2bdZGo', 'Stratégie', VideoLevel::Intermediaire, "Pot odds, équité de seuil des tirages et bluff (en anglais, 8 min). Vidéo de WinnerInAWeek, licence Creative Commons Attribution (CC BY)."],
        ['Le guide complet du poker : mains, position et bluff', 'https://www.youtube.com/watch?v=IglnKzITPWI', 'Stratégie', VideoLevel::Debutant, "Choisir ses mains, exploiter sa position et bluffer à bon escient (en anglais, 45 min). Vidéo d'AceHighTV, licence Creative Commons Attribution (CC BY)."],
        ['Les tableaux de mains de départ en No-Limit Hold’em', 'https://www.youtube.com/watch?v=ElkeegAG-NM', 'Préflop', VideoLevel::Debutant, "Quelles mains jouer avant le flop selon la position, en cash game comme en tournoi (en anglais, 21 min). Vidéo de WinnerInAWeek, licence Creative Commons Attribution (CC BY)."],
        ['Le vocabulaire du poker expliqué (épisode 1)', 'https://www.youtube.com/watch?v=nqdPTyHGyM8', 'Règles', VideoLevel::Debutant, "Les termes indispensables pour suivre une partie (en anglais, 3 min). Vidéo d'AceHighTV, licence Creative Commons Attribution (CC BY)."],
        ['Le vocabulaire du poker expliqué (épisode 2)', 'https://www.youtube.com/watch?v=u6Pp9EJWYwI', 'Règles', VideoLevel::Debutant, "Suite du lexique du joueur, cash game et tournoi (en anglais, 4 min). Vidéo d'AceHighTV, licence Creative Commons Attribution (CC BY)."],
        ['Gérer sa bankroll : les fondamentaux', 'https://www.youtube.com/watch?v=OG2AGXd_C8E', 'Gestion', VideoLevel::Debutant, "Choisir ses limites et réduire le risque de ruine (en anglais, 8 min). Vidéo de Poker Strategy (thepokerbank.com), licence Creative Commons Attribution (CC BY)."],
        ['Psychologie du poker : comprendre et maîtriser le tilt', 'https://www.youtube.com/watch?v=LSRkE2urFUc', 'Mental', VideoLevel::Intermediaire, "Les formes du tilt et des routines pour garder son calme, au ton posé (en anglais, 31 min). Vidéo d'AceHighTV, licence Creative Commons Attribution (CC BY)."],
        ['Push or fold : les seuils de Sklansky-Chubukov', 'https://www.youtube.com/watch?v=mEhEyZ9efG8', 'Tournoi', VideoLevel::Intermediaire, "Quand partir à tapis avec un petit tapis en tournoi (en anglais, 13 min). Vidéo de WinnerInAWeek, licence Creative Commons Attribution (CC BY)."],
        ['Les affrontements préflop : l’équité de vos mains', 'https://www.youtube.com/watch?v=6HHwYX20fGE', 'Préflop', VideoLevel::Intermediaire, "Paire contre cartes hautes, main dominée : les pourcentages à connaître (en anglais, 18 min). Vidéo de WinnerInAWeek, licence Creative Commons Attribution (CC BY)."],
        ['Profiler ses adversaires : statistiques et styles de jeu', 'https://www.youtube.com/watch?v=xgWAPvKivyE', 'Stratégie', VideoLevel::Intermediaire, "Reconnaître les styles de jeu à partir de leurs statistiques (en anglais, 19 min). Vidéo de WinnerInAWeek, licence Creative Commons Attribution (CC BY)."],
        ['Battre les 5 grands types de joueurs', 'https://www.youtube.com/watch?v=_UvaDPjg2WM', 'Stratégie', VideoLevel::Intermediaire, "Repérer et exploiter le joueur serré-passif, le suiveur, l'agressif et le récréatif (en anglais, 29 min). Vidéo de Mind of a Grinder, licence Creative Commons Attribution (CC BY)."],
    ];
}
