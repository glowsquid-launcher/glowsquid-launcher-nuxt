module.exports = {
  header: {
    home: 'accueil',
    instances: 'instances',
    about: 'à propos',
    accounts: {
      addAcc: 'Ajouter un compte',
      subtitle: 'Allez-y, ajoutez votre premier ou autre compte !',
      placeholder: 'Comptes'
    }
  },
  authModal: {
    title: 'Ajouter un utilisateur',
    email: 'e-mail',
    password: 'mot de passe',
    submit: 'envoyer',
    close: 'fermer'
  },
  addInstanceModal: {
    instanceName: 'Nom de l\'instance',
    selectVersion: 'Séléctionner la version',
    selectFabricVersion: 'Séléctionner la version de Fabric',
    showUnstable: 'Afficher les versions instables',
    title: 'Configurer l\'instance | Séléctionner un modèle | Autres paramètres',
    ramSettings: {
      title: 'Paramètres de la RAM',
      minRam: {
        title: 'RAM min.',
        hint: 'RAM minimum allouée à Minecraft'
      },
      maxRam: {
        title: 'RAM max.',
        hint: 'RAM maximum allouée à Minecraft'
      }
    },
    randomSettings: {
      title: 'Autres paramètres',
      assetRoot: {
        title: 'Emplacement des assets',
        hint: 'Vous ne devriez pas à avoir à modifier ce paramètre. Laissez vide pour défaut.'
      }
    }
  },
  settings: {
    title: 'Paramètres',
    sections: {
      general: {
        title: 'Général',
        listView: {
          name: 'Affichage en liste',
          subtitle: 'Affiche les instances en liste au lieu d\'une grille.'
        }
      }
    }
  },
  pages: {
    home: {
      text: 'Bienvenue dans 🅱️lowsquid, le launcher Minecraft fait pour Fabric et fonctionnant avec Modrinth'
    },
    about: {
      title: 'Page de test, rien à voir ici. :/',
      toast: 'baguette'
    },
    instances: {
      search: 'Rechercher',
      status: 'État: En train de télécharger {download} | Type: {type} | {percent}% téléchargé.',
      launch: 'Lancer',
      moreInfo: 'Plus d\'infos',
      settings: 'Paramètres (Supprime les instances)',
      mcVersion: 'Version de Minecraft : <span class="font-bold">{version}</span>',
      fabricVersion: 'Version de Fabric : <span class="font-bold">{version}</span>'
    },
    instance: {
      status: 'État: En train de télécharger {download} | Type: {type} | {percent}% téléchargé.',
      addMods: 'Ajouter des mods',
      settings: 'Paramètres',
      tabs: {
        description: 'Description',
        mods: 'Mods'
      }
    },
    mods: {
      search: 'Rechercher des mods',
      about: 'À propos',
      install: 'Installer',
      hint: 'ous pouvez écrire le nom du mod, son auteur et sa catégorie ici.'
    },
    mod: {
      install: 'Installer'
    }
  }
}
