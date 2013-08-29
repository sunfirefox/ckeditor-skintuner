/**
 * @license Copyright (c) 2003-2013, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */
( function() {

	/* jslint browser: true */

	"use strict";

	var editorScriptElement,
		emergencyTimeoutThatAwaitsForEditorToBeLoadedId,
		emergencyTimeoutThatAwaitsForEditorToBeLoadedTimeout = 1000,
		initializeEditor, // private, function
		insertTimeout = 100,
		findPresentationConfigurations, // private, function
		onEditorInitialized, // private, function
		parsePresentationConfigurationScript, // private, function
		possibleEditorLocations = [
			// skintuner is most probably placed inside /dev/skintuner
			// directory; no further search is needed
			"../../ckeditor.js",
			"./components/ckeditor/ckeditor.js",
			"./ckeditor.js",
			"../ckeditor.js"
		];

	/**
	 * @param {HTMLElement} container
	 * @return {array}
	 */
	findPresentationConfigurations = function( container ) {
		var i,
			ret = [],
			scripts = container.getElementsByTagName( "script" );

		for ( i = 0; i < scripts.length; i += 1 ) {
			if ( "application/json" === scripts[ i ].type ) {
				ret.push( parsePresentationConfigurationScript( scripts[ i ] ) );
			}
		}

		return ret;
	};

	/**
	 * @return {void}
	 */
	initializeEditor = function() {
		if ( window.CKEDITOR || possibleEditorLocations.length < 1 ) {
			return;
		}

		if ( editorScriptElement ) {
			// do some cleanup
			document.body.removeChild( editorScriptElement );
			editorScriptElement = null;
		}

		editorScriptElement = document.createElement( "script" );
		editorScriptElement.src = possibleEditorLocations.shift();

		document.body.appendChild( editorScriptElement );

		setTimeout( initializeEditor, insertTimeout );
	};

	/**
	 * @param {CKEDITOR} CKEDITOR
	 * @param {CKEditor/SkinTuner/modules/skintuner} skintuner
	 * @return {void}
	 */
	onEditorInitialized = function( CKEDITOR, skintuner ) {
		var configurations,
			container = document.body;

		clearTimeout( emergencyTimeoutThatAwaitsForEditorToBeLoadedId );

		configurations = findPresentationConfigurations( container );
		skintuner.presentEditorElements( CKEDITOR, container, configurations );
	};

	/**
	 * @param {HTMLScriptElement} script
	 * @return {object}
	 */
	parsePresentationConfigurationScript = function( script ) {
		return JSON.parse( script.innerHTML );
	};

	emergencyTimeoutThatAwaitsForEditorToBeLoadedId = setTimeout( function() {
		// editor is not loaded for too long, probably there is some random
		// network error
		window.location.reload();
		window.location.href = window.location.href;
	}, emergencyTimeoutThatAwaitsForEditorToBeLoadedTimeout );

	setTimeout( initializeEditor, 0 );

	require( [ "modules/ckeditor-skintuner" ], function( skintuner ) {

		var arbitraryIntervalThatAwaitsForCKEditorToBeReadyId = [],
			arbitraryIntervalThatAwaitsForCKEditorToBeReadyTimeout = 10;

		arbitraryIntervalThatAwaitsForCKEditorToBeReadyId = setInterval( function() {
			var CKEDITOR = window.CKEDITOR;

			if ( !CKEDITOR || !CKEDITOR.on ) {
				return;
			}

			clearInterval( arbitraryIntervalThatAwaitsForCKEditorToBeReadyId );

			CKEDITOR.on( 'loaded', function() {
				onEditorInitialized( CKEDITOR, skintuner );
			} );
		}, arbitraryIntervalThatAwaitsForCKEditorToBeReadyTimeout );

	} );

}() );
